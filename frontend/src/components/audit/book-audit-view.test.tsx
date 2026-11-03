import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookAuditView from './book-audit-view';
import { submitToProspects } from '@/lib/api';

// Mock the API client
jest.mock('@/lib/api', () => ({
  submitToProspects: jest.fn().mockResolvedValue({ status: 'success', id: 'audit-123' }),
}));

describe('BookAuditView Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders executive audit hero, MCP engine stack, and 9-page chapter overview', () => {
    render(<BookAuditView />);

    // Header & Hero
    expect(screen.getByText(/AuraWorks Executive SEO & GEO Audit/i)).toBeInTheDocument();
    expect(screen.getByText(/Empirical Search Dominance & AI Citability Audit/i)).toBeInTheDocument();

    // 4-Engine MCP Stack
    expect(screen.getByText('Google Search Console MCP')).toBeInTheDocument();
    expect(screen.getByText('Google Trends MCP')).toBeInTheDocument();
    expect(screen.getByText('OpenSEO MCP')).toBeInTheDocument();
    expect(screen.getByText('Google Gemini MCP')).toBeInTheDocument();

    // 4-Box Scorecard
    expect(screen.getByText('The 4-Box Executive Scorecard')).toBeInTheDocument();
    expect(screen.getByText('Technical Base')).toBeInTheDocument();
    expect(screen.getByText('Content & On-Page')).toBeInTheDocument();
    expect(screen.getByText('Schema & Entities')).toBeInTheDocument();
    expect(screen.getByText('GEO / AI Readiness')).toBeInTheDocument();

    // 9-Page Chapters
    expect(screen.getByText('The 9-Page Boardroom Deliverable')).toBeInTheDocument();
    expect(screen.getByText('Executive Cover & Profile')).toBeInTheDocument();
    expect(screen.getByText('90-Day Sprint Roadmap')).toBeInTheDocument();
  });

  test('completes 2-step audit booking flow and submits to prospects API', async () => {
    localStorage.setItem('aura_uid', 'test-aura-signature-99');
    render(<BookAuditView />);

    // Step 1: Corporate Identity
    expect(screen.getByText(/Phase 01 of 02/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Reitumetse Sethabela' } });
    fireEvent.change(screen.getByLabelText(/Work Email/i), { target: { value: 'reitumetse@rand-industrial.co.za' } });
    fireEvent.change(screen.getByLabelText(/Company \/ Enterprise Name/i), { target: { value: 'Rand Industrial Holdings' } });
    fireEvent.change(screen.getByLabelText(/Industry Vertical/i), { target: { value: 'mining' } });

    fireEvent.click(screen.getByRole('button', { name: /continue to telemetry scope/i }));

    // Step 2: Target Domain & Telemetry Scope
    await waitFor(() => {
      expect(screen.getByText(/Phase 02 of 02/i)).toBeInTheDocument();
      expect(screen.getByText(/Telemetry Scope & Domain/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Target Website URL/i), { target: { value: 'https://www.rand-industrial.co.za' } });
    fireEvent.change(screen.getByLabelText(/Estimated Monthly Traffic/i), { target: { value: '5k-20k' } });
    fireEvent.change(screen.getByLabelText(/GSC \/ Telemetry Status/i), { target: { value: 'active' } });
    fireEvent.change(screen.getByLabelText(/Primary Competitor/i), { target: { value: 'competitor-mining.co.za' } });
    fireEvent.change(screen.getByLabelText(/Priority Service \/ Keyword/i), { target: { value: 'Bulk Slurry Valves' } });

    fireEvent.click(screen.getByRole('button', { name: /request 9-page audit report/i }));

    await waitFor(() => {
      expect(submitToProspects).toHaveBeenCalledWith({
        name: 'Reitumetse Sethabela',
        email: 'reitumetse@rand-industrial.co.za',
        company: 'Rand Industrial Holdings',
        industry: 'mining',
        website: 'https://www.rand-industrial.co.za',
        traffic: '5k-20k',
        gsc_status: 'active',
        primary_competitor: 'competitor-mining.co.za',
        target_focus: 'Bulk Slurry Valves',
        source: 'executive_audit_request',
        audit_type: 'mcp_executive_9_page_audit',
        aura_id: 'test-aura-signature-99',
      });
    });

    // Success Screen
    expect(screen.getByText(/Executive Audit Initialized/i)).toBeInTheDocument();
    expect(screen.getAllByText('https://www.rand-industrial.co.za').length).toBeGreaterThanOrEqual(1);
  });
});
