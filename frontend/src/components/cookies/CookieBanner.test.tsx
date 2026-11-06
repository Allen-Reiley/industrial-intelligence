import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CookieBanner from './CookieBanner';

jest.mock('posthog-js', () => ({
  __esModule: true,
  default: {
    opt_in_capturing: jest.fn(),
    opt_out_capturing: jest.fn(),
  },
}));

describe('CookieBanner Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('does not render immediately before timer fires', () => {
    render(<CookieBanner />);
    expect(screen.queryByRole('region', { name: /cookie consent banner/i })).not.toBeInTheDocument();
  });

  test('renders after timer fires when no prior consent is stored', () => {
    render(<CookieBanner />);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByRole('region', { name: /cookie consent banner/i })).toBeInTheDocument();
    expect(screen.getByText(/Cookie & Privacy Consent/i)).toBeInTheDocument();
  });

  test('does not render if consent has already been accepted', () => {
    localStorage.setItem('aura_cookie_consent', 'accepted');
    render(<CookieBanner />);
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(screen.queryByRole('region', { name: /cookie consent banner/i })).not.toBeInTheDocument();
  });

  test('accepting all stores consent and dismisses banner', () => {
    render(<CookieBanner />);
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const acceptBtn = screen.getByRole('button', { name: /accept all/i });
    fireEvent.click(acceptBtn);

    expect(localStorage.getItem('aura_cookie_consent')).toBe('accepted');
    expect(screen.queryByRole('region', { name: /cookie consent banner/i })).not.toBeInTheDocument();
  });

  test('declining stores declined state, calls posthog opt-out and dismisses banner', () => {
    const posthog = require('posthog-js').default;
    render(<CookieBanner />);
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const declineBtn = screen.getByRole('button', { name: /essential only/i });
    fireEvent.click(declineBtn);

    expect(localStorage.getItem('aura_cookie_consent')).toBe('declined');
    expect(posthog.opt_out_capturing).toHaveBeenCalled();
    expect(screen.queryByRole('region', { name: /cookie consent banner/i })).not.toBeInTheDocument();
  });
});
