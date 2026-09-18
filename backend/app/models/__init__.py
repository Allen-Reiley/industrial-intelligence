# backend/app/models/__init__.py
from .client import Client, ClientCategory, SubscriptionStatus
from .company import Company
from .department import Department
from .visit import Visit, VerificationStatus
from .pageview import PageView
from .event import Event
from .prospect import Prospect
from .enrichment_queue import EnrichmentQueue, FailedEnrichment, QueueType
from .notification_throttle import NotificationThrottle
from .crm_dead_letter import CrmDeadLetter
from .inbound_message import InboundMessage, MessageStatus
from .transaction import Transaction, TransactionStatus
from .admin_user import AdminUser
from .user import User, OAuthAccount

# Do NOT include router logic here