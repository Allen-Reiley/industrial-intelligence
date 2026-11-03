'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function NewsletterSignup() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-center">
        <p className="text-sm font-semibold text-primary">✓ You have been added to the Priority Dispatch list.</p>
        <p className="text-xs text-muted-foreground mt-1">We will notify you when the first benchmark briefing goes live.</p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          placeholder="corporate.email@company.co.za"
          className="flex-1 rounded-xl border bg-background/80 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary shadow-inner"
        />
        <Button type="submit" className="rounded-xl px-5 font-semibold shrink-0">
          Get Briefings
        </Button>
      </form>
      <p className="text-[11px] text-muted-foreground/70 mt-2 text-center sm:text-left">
        Strictly B2B insights. Zero spam. Fully POPIA compliant.
      </p>
    </div>
  );
}
