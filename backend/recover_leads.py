#!/usr/bin/env python3
"""Convenience entry point for backend/scripts/recover_leads.py"""
import sys
import os
import asyncio

backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from scripts.recover_leads import main

if __name__ == "__main__":
    asyncio.run(main())
