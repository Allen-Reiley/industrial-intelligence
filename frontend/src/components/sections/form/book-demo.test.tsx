import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookDemoPage from './book-demo';
import { submitToProspects } from '@/lib/api';

// Mock the API client
jest.mock('@/lib/api', () => ({
  submitToProspects: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('BookDemoPage Form Submission Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successfully navigates steps and submits the form data', async () => {
    (submitToProspects as jest.Mock).mockResolvedValue({ status: 'success' });

    render(<BookDemoPage />);

    // --- STEP 1: Identification Form ---
    // Assert Step 1 is active
    expect(screen.getByText('Phase 01')).toBeInTheDocument();

    // Fill in Step 1 fields
    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Alice Smith' } });
    fireEvent.change(screen.getByPlaceholderText('john@mining.co.za'), { target: { value: 'alice@manufacturing.co.za' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Rand Industrial'), { target: { value: 'Alice Corp' } });
    
    // Select Industry (first combobox in DOM)
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'manufacturing' } });

    // Submit Step 1
    const continueButton = screen.getByRole('button', { name: /continue to audit/i });
    fireEvent.click(continueButton);

    // --- STEP 2: Qualification Audit Form ---
    // Wait for Step 2 indicators to be visible
    await waitFor(() => {
      expect(screen.getByText('Phase 02')).toBeInTheDocument();
    });

    // Fill in Step 2 fields
    fireEvent.change(screen.getByPlaceholderText('https://...'), { target: { value: 'https://alicecorp.co.za' } });
    
    // Select Traffic (index 1), Avg Price (index 2), CRM (index 3)
    fireEvent.change(selects[1], { target: { value: '5k-20k' } });
    fireEvent.change(selects[2], { target: { value: '150k-500k' } });
    fireEvent.change(selects[3], { target: { value: 'hubspot' } });

    // Submit the Form
    const submitButton = screen.getByRole('button', { name: /request access/i });
    fireEvent.click(submitButton);

    // --- ASSERTIONS & SUCCESS TRANSITION ---
    await waitFor(() => {
      expect(submitToProspects).toHaveBeenCalledTimes(1);
    });

    expect(submitToProspects).toHaveBeenCalledWith({
      name: 'Alice Smith',
      email: 'alice@manufacturing.co.za',
      company: 'Alice Corp',
      industry: 'manufacturing',
      website: 'https://alicecorp.co.za',
      traffic: '5k-20k',
      avg_price: '150k-500k',
      crm: 'hubspot',
      aura_id: null,
    });

    // Assert transition to success state and correct confirmation message text
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /access requested/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/An email has been sent to/i)).toBeInTheDocument();
    expect(screen.getByText(/alice@manufacturing.co.za/i)).toBeInTheDocument();
    expect(screen.getByText(/Please check your inbox \(and spam folder\) for the Calendly scheduling link\./i)).toBeInTheDocument();
  });

  test('validates work email format before moving to step 2', () => {
    render(<BookDemoPage />);
    
    // Mock window.alert
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Fill in other required fields so HTML5 validation passes
    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Alice Smith' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Rand Industrial'), { target: { value: 'Alice Corp' } });
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'manufacturing' } });

    // Try to continue with invalid email (partially valid for HTML5 but fails custom regex)
    fireEvent.change(screen.getByPlaceholderText('john@mining.co.za'), { target: { value: 'test@example' } });
    
    const continueButton = screen.getByRole('button', { name: /continue to audit/i });
    fireEvent.click(continueButton);

    expect(alertMock).toHaveBeenCalledWith('Please enter a valid work email address.');
    expect(screen.getByText('Phase 01')).toBeInTheDocument();
    expect(screen.queryByText('Phase 02')).not.toBeInTheDocument();

    alertMock.mockRestore();
  });
});
