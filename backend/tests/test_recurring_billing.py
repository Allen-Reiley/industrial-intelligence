import pytest
from datetime import datetime, timezone, timedelta
from uuid import uuid4
from unittest.mock import patch, AsyncMock, MagicMock
from sqlmodel import select

from app.models.client import Client, SubscriptionStatus
from app.models.transaction import Transaction, TransactionStatus
from app.db import async_session_maker
from app.core.scheduler import execute_recurring_billing

pytestmark = pytest.mark.anyio

@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"

@pytest.fixture(autouse=True)
async def cleanup_db():
    from sqlalchemy import text
    async with async_session_maker() as session:
        await session.execute(text("TRUNCATE TABLE client CASCADE;"))
        await session.commit()
    yield
    async with async_session_maker() as session:
        await session.execute(text("TRUNCATE TABLE client CASCADE;"))
        await session.commit()

async def test_recurring_billing_monthly_and_annual_triggers():
    """
    Test first-of-month recurring billing trigger.
    Asserts active monthly and annual clients (whose anniversary month it is) get billed.
    """
    client_monthly = uuid4()
    client_annual = uuid4()
    client_annual_not_anniversary = uuid4()
    
    now = datetime(2026, 6, 1, 12, 0, 0, tzinfo=timezone.utc) # 1st of June
    
    async with async_session_maker() as session:
        # 1. Monthly Active client (should get billed full amount on 1st)
        c_m = Client(
            id=client_monthly,
            company_name="Active Monthly Corp",
            domain="activemonthly.com",
            subscription_status=SubscriptionStatus.ACTIVE,
            billing_cycle="monthly",
            payment_method_token="token_monthly",
            is_active=True,
            trial_ends_at=datetime(2026, 5, 15, tzinfo=timezone.utc)
        )
        # 2. Annual Active client in anniversary month (trial ended in June 2025 -> should get billed on 1st June 2026)
        c_a = Client(
            id=client_annual,
            company_name="Active Annual Anniversary Corp",
            domain="activeannual.com",
            subscription_status=SubscriptionStatus.ACTIVE,
            billing_cycle="annual",
            payment_method_token="token_annual",
            is_active=True,
            trial_ends_at=datetime(2025, 6, 15, tzinfo=timezone.utc)
        )
        # 3. Annual Active client NOT in anniversary month (trial ended in Oct 2025 -> should NOT get billed)
        c_a_not = Client(
            id=client_annual_not_anniversary,
            company_name="Active Annual Not Anniversary Corp",
            domain="notanniversary.com",
            subscription_status=SubscriptionStatus.ACTIVE,
            billing_cycle="annual",
            payment_method_token="token_annual_not",
            is_active=True,
            trial_ends_at=datetime(2025, 10, 15, tzinfo=timezone.utc)
        )
        session.add(c_m)
        session.add(c_a)
        session.add(c_a_not)
        await session.commit()

    with patch("app.core.scheduler.get_current_time", return_value=now), \
         patch("app.services.payment.IkhokhaClient.charge_token") as mock_charge:
        
        # Monthly charge succeeds, Annual charge fails
        mock_charge.side_effect = lambda cid, amt, tok: (
            {"status": "success", "transactionId": f"tx_ok_{uuid4()}"} if tok == "token_monthly"
            else {"status": "failed", "errorMessage": "Card declined"}
        )
        
        await execute_recurring_billing()
        
        # Should have attempted to charge Monthly and Annual Anniversary, but NOT the other one
        assert mock_charge.call_count == 2
        mock_charge.assert_any_call(client_monthly, 1000000, "token_monthly")
        mock_charge.assert_any_call(client_annual, 12000000, "token_annual")

    # Verify transactions logged
    async with async_session_maker() as session:
        # Monthly should have successful transaction
        stmt_m = select(Transaction).where(Transaction.client_id == client_monthly)
        res_m = await session.execute(stmt_m)
        txs_m = res_m.scalars().all()
        assert len(txs_m) == 1
        assert txs_m[0].status == TransactionStatus.SUCCESSFUL
        
        # Annual should have failed transaction
        stmt_a = select(Transaction).where(Transaction.client_id == client_annual)
        res_a = await session.execute(stmt_a)
        txs_a = res_a.scalars().all()
        assert len(txs_a) == 1
        assert txs_a[0].status == TransactionStatus.FAILED
        
        # Not Anniversary should have no transactions
        stmt_not = select(Transaction).where(Transaction.client_id == client_annual_not_anniversary)
        res_not = await session.execute(stmt_not)
        txs_not = res_not.scalars().all()
        assert len(txs_not) == 0


async def test_recurring_billing_grace_period_retries():
    """
    Test grace period retry cron.
    - Monthly client retry succeeds -> client remains active.
    - Annual client retry fails -> client is suspended.
    """
    client_monthly = uuid4()
    client_annual = uuid4()
    
    now = datetime(2026, 6, 4, 12, 0, 0, tzinfo=timezone.utc) # 4th of June
    
    async with async_session_maker() as session:
        # Monthly active client whose renewal failed 3 days ago (June 1st)
        c_m = Client(
            id=client_monthly,
            company_name="Grace Monthly Corp",
            domain="gracemonthly.com",
            subscription_status=SubscriptionStatus.ACTIVE,
            billing_cycle="monthly",
            payment_method_token="token_m",
            is_active=True
        )
        tx_m = Transaction(
            client_id=client_monthly,
            amount=1000000,
            currency="ZAR",
            status=TransactionStatus.FAILED,
            gateway_reference="fail_tx_m",
            payment_method_token="token_m",
            created_at=datetime(2026, 6, 1, 12, 0, 0, tzinfo=timezone.utc)
        )
        
        # Annual active client whose renewal failed 7 days ago (May 28th)
        c_a = Client(
            id=client_annual,
            company_name="Grace Annual Corp",
            domain="graceannual.com",
            subscription_status=SubscriptionStatus.ACTIVE,
            billing_cycle="annual",
            payment_method_token="token_a",
            is_active=True
        )
        tx_a = Transaction(
            client_id=client_annual,
            amount=12000000,
            currency="ZAR",
            status=TransactionStatus.FAILED,
            gateway_reference="fail_tx_a",
            payment_method_token="token_a",
            created_at=datetime(2026, 5, 28, 12, 0, 0, tzinfo=timezone.utc)
        )
        
        session.add(c_m)
        session.add(tx_m)
        session.add(c_a)
        session.add(tx_a)
        await session.commit()

    with patch("app.core.scheduler.get_current_time", return_value=now), \
         patch("app.services.payment.IkhokhaClient.charge_token") as mock_charge:
         
        # Monthly succeeds, Annual fails
        mock_charge.side_effect = lambda cid, amt, tok: (
            {"status": "success", "transactionId": f"tx_ok_{uuid4()}"} if tok == "token_m"
            else {"status": "failed", "errorMessage": "Card declined again"}
        )
        
        await execute_recurring_billing()

    # Verify state updates
    async with async_session_maker() as session:
        db_m = await session.get(Client, client_monthly)
        db_a = await session.get(Client, client_annual)
        
        # Monthly client succeeded retry -> remains ACTIVE and active=True
        assert db_m.subscription_status == SubscriptionStatus.ACTIVE
        assert db_m.is_active is True
        
        # Annual client failed retry -> suspended and active=False
        assert db_a.subscription_status == SubscriptionStatus.SUSPENDED
        assert db_a.is_active is False


async def test_trial_end_tzero_billing():
    """
    Test T-Zero charging at trial end.
    - Trial client ends now -> gets charged, status becomes ACTIVE.
    """
    client_trial = uuid4()
    now = datetime(2026, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
    
    async with async_session_maker() as session:
        # Trial ended on June 15th
        c_t = Client(
            id=client_trial,
            company_name="Trial Expired Corp",
            domain="trialexpired.com",
            subscription_status=SubscriptionStatus.TRIAL,
            billing_cycle="monthly",
            payment_method_token="token_t",
            is_active=True,
            trial_ends_at=now
        )
        session.add(c_t)
        await session.commit()

    with patch("app.core.scheduler.get_current_time", return_value=now), \
         patch("app.services.payment.IkhokhaClient.charge_token", return_value={"status": "success", "transactionId": "tx_trial_ok"}) as mock_charge:
         
        await execute_recurring_billing()
        
        # Ends on 15th of June -> Mid Month End -> Flat R5k (500000 cents)
        mock_charge.assert_called_once_with(client_trial, 500000, "token_t")

    # Verify DB updates
    async with async_session_maker() as session:
        db_client = await session.get(Client, client_trial)
        assert db_client.subscription_status == SubscriptionStatus.ACTIVE
        assert db_client.is_active is True
