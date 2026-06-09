# backend/app/core/cache.py
import logging
from typing import Optional, Any
from cachetools import TTLCache
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger("auraworks.cache")

# Tier 2: In-Memory LRU Cache with TTL (max size 1000 items, TTL 5 minutes)
_memory_cache = TTLCache(maxsize=1000, ttl=300)

_redis_client: Optional[aioredis.Redis] = None

def get_redis_client() -> Optional[aioredis.Redis]:
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    
    if settings.REDIS_URL:
        try:
            # decode_responses=True maps raw bytes returned by Redis to standard Python strings.
            # socket_timeout=1.0 prevents client routes from waiting indefinitely on hanging connections.
            _redis_client = aioredis.from_url(
                settings.REDIS_URL,
                socket_timeout=1.0,
                decode_responses=True
            )
            return _redis_client
        except Exception as e:
            logger.warning(f"Failed to initialize Redis client: {e}. Falling back to in-memory cache.")
    return None

class TwoTierCache:
    @classmethod
    async def get(cls, key: str) -> Optional[str]:
        """
        Attempts to read from Redis (Tier 1).
        If Redis is unreachable or raises any error, silently falls back to the local in-memory LRU cache (Tier 2).
        """
        redis_client = get_redis_client()
        if redis_client:
            try:
                val = await redis_client.get(key)
                if val is not None:
                    return val
            except Exception as e:
                logger.warning(f"Redis GET failed (key={key}): {e}. Gracefully falling back to in-memory cache.")
        
        # Tier 2: LRU Cache Fallback
        return _memory_cache.get(key)

    @classmethod
    async def set(cls, key: str, value: str, expire: int = 300) -> None:
        """
        Attempts to write to Redis (Tier 1).
        If Redis fails, falls back to local in-memory cache.
        """
        redis_client = get_redis_client()
        if redis_client:
            try:
                await redis_client.set(key, value, ex=expire)
                return
            except Exception as e:
                logger.warning(f"Redis SET failed (key={key}): {e}. Gracefully falling back to in-memory cache.")
        
        # Tier 2: LRU Cache Fallback
        _memory_cache[key] = value

    @classmethod
    def clear(cls) -> None:
        """
        Clears the local memory cache (primarily for test isolation).
        """
        _memory_cache.clear()
