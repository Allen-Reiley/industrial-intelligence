import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VSLFunnel from './vsl-funnel';
import { trackIntent } from '@/lib/api';

// Mock useRouter from next/navigation
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

// Mock the API client
jest.mock('@/lib/api', () => ({
  trackIntent: jest.fn().mockResolvedValue({ status: 'success' }),
}));

describe('VSLFunnel Component Tests', () => {
  beforeAll(() => {
    // Mock HTML5 Video properties
    window.HTMLVideoElement.prototype.play = jest.fn().mockResolvedValue(undefined);
    window.HTMLVideoElement.prototype.pause = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Reset window.history length if needed, or mock it
    Object.defineProperty(window, 'history', {
      writable: true,
      value: { length: 2 },
    });
  });

  test('renders in a distraction-free layout without global elements, but has Go Back button', () => {
    const { container } = render(<VSLFunnel />);
    
    // Check for "Go Back" button
    expect(screen.getByText('Go Back')).toBeInTheDocument();
    
    // Check for Heading
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    
    // Check for Video element
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    
    // CTA should NOT be visible initially
    expect(screen.queryByText('Book Demo')).not.toBeInTheDocument();
  });

  test('Go Back button works with history back fallback', () => {
    render(<VSLFunnel />);
    
    const backBtn = screen.getByText('Go Back');
    fireEvent.click(backBtn);
    
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  test('Go Back button pushes fallback path when history is empty', () => {
    Object.defineProperty(window, 'history', {
      writable: true,
      value: { length: 1 },
    });
    
    render(<VSLFunnel />);
    
    const backBtn = screen.getByText('Go Back');
    fireEvent.click(backBtn);
    
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  test('dispatches telemetry pings at 25%, 50%, 75%, and 100% completion milestones', async () => {
    const { container } = render(<VSLFunnel />);
    const video = container.querySelector('video') as HTMLVideoElement;
    
    // Mock duration
    Object.defineProperty(video, 'duration', { writable: true, value: 100 });
    
    // 1. Move to 25%
    Object.defineProperty(video, 'currentTime', { writable: true, value: 25 });
    fireEvent.timeUpdate(video);
    
    await waitFor(() => {
      expect(trackIntent).toHaveBeenCalledWith({
        client_id: 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0',
        aura_id: 'anonymous-vsl-visitor',
        vsl_completion_percentage: 25,
      });
    });

    // 2. Move to 50%
    Object.defineProperty(video, 'currentTime', { writable: true, value: 50 });
    fireEvent.timeUpdate(video);
    
    await waitFor(() => {
      expect(trackIntent).toHaveBeenCalledWith({
        client_id: 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0',
        aura_id: 'anonymous-vsl-visitor',
        vsl_completion_percentage: 50,
      });
    });

    // 3. Move to 75%
    Object.defineProperty(video, 'currentTime', { writable: true, value: 75 });
    fireEvent.timeUpdate(video);
    
    await waitFor(() => {
      expect(trackIntent).toHaveBeenCalledWith({
        client_id: 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0',
        aura_id: 'anonymous-vsl-visitor',
        vsl_completion_percentage: 75,
      });
    });

    // 4. End video (100% completion)
    fireEvent.ended(video);
    
    await waitFor(() => {
      expect(trackIntent).toHaveBeenCalledWith({
        client_id: 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0',
        aura_id: 'anonymous-vsl-visitor',
        vsl_completion_percentage: 100,
      });
    });
    
    // Assert CTA and Micro-copy is revealed
    expect(screen.getByText('Ready to de-anonymize your website traffic?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /book demo/i })).toBeInTheDocument();
  });

  test('triggers warm abandonment telemetry after 10 seconds of completion without action', async () => {
    jest.useFakeTimers();
    const { container } = render(<VSLFunnel />);
    const video = container.querySelector('video') as HTMLVideoElement;
    
    Object.defineProperty(video, 'duration', { writable: true, value: 100 });
    
    // Complete the video
    fireEvent.ended(video);
    
    // Telemetry for 100% completion is fired immediately
    await waitFor(() => {
      expect(trackIntent).toHaveBeenCalledWith({
        client_id: 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0',
        aura_id: 'anonymous-vsl-visitor',
        vsl_completion_percentage: 100,
      });
    });
    
    // Fast-forward 10 seconds to trigger warm abandonment
    jest.advanceTimersByTime(10000);
    
    await waitFor(() => {
      expect(trackIntent).toHaveBeenCalledWith({
        client_id: 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0',
        aura_id: 'anonymous-vsl-visitor',
        vsl_completion_percentage: 100,
        vsl_abandoned: true,
      });
    });
    
    jest.useRealTimers();
  });

  test('clears abandonment timer, sets abandoned to false, and redirects when CTA is clicked', async () => {
    jest.useFakeTimers();
    const { container } = render(<VSLFunnel />);
    const video = container.querySelector('video') as HTMLVideoElement;
    
    Object.defineProperty(video, 'duration', { writable: true, value: 100 });
    
    // Complete the video to show CTA
    fireEvent.ended(video);
    
    // Click the Book Demo CTA
    const ctaButton = await screen.findByRole('button', { name: /book demo/i });
    fireEvent.click(ctaButton);
    
    // Abandoned false telemetry should be sent
    await waitFor(() => {
      expect(trackIntent).toHaveBeenCalledWith({
        client_id: 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0',
        aura_id: 'anonymous-vsl-visitor',
        vsl_completion_percentage: 100,
        vsl_abandoned: false,
      });
    });

    // Advance time and verify that abandonment telemetry was NOT called
    jest.advanceTimersByTime(10000);
    expect(trackIntent).not.toHaveBeenCalledWith(expect.objectContaining({ vsl_abandoned: true }));
    
    // Verify redirection
    expect(mockPush).toHaveBeenCalledWith('/book-demo');
    
    jest.useRealTimers();
  });
});
