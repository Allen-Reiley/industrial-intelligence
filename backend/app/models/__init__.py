# backend/app/models/__init__.py
from .client import Client, ClientCategory, SubscriptionStatus
from .company import Company
from .department import Department
from .visit import Visit, VerificationStatus
from .pageview import PageView
from .prospect import Prospect
from .enrichment_queue import EnrichmentQueue, FailedEnrichment, QueueType
from .notification_throttle import NotificationThrottle
from .crm_dead_letter import CrmDeadLetter
from .inbound_message import InboundMessage, MessageStatus

# Do NOT include router logic here