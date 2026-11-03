import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeroSection from './hero-section';
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

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('HeroSection Video Component Tests', () => {
  beforeAll(() => {
    window.HTMLVideoElement.prototype.play = jest.fn().mockResolvedValue(undefined);
    window.HTMLVideoElement.prototype.pause = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders hero section with headline, Book Demo and Book Audit CTAs, and video element', () => {
    const { container } = render(<HeroSection />);

    expect(screen.getByText(/Operational Clarity\. Predictable Cashflow\./i)).toBeInTheDocument();
    
    // Header + Hero CTAs contain Book Audit and Book Demo links
    const bookAuditLinks = screen.getAllByRole('link', { name: /book audit/i });
    expect(bookAuditLinks.length).toBeGreaterThanOrEqual(1);
    expect(bookAuditLinks[0]).toHaveAttribute('href', '/book-audit');

    const bookDemoLinks = screen.getAllByRole('link', { name: /book demo/i });
    expect(bookDemoLinks.length).toBeGreaterThanOrEqual(1);
    expect(bookDemoLinks[0]).toHaveAttribute('href', '/book-demo');

    expect(screen.getByText('Watch System Walkthrough')).toBeInTheDocument();

    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', 'https://ik.imagekit.io/lcpi94xy3/final-demo.mp4');
    expect(video).toHaveAttribute('poster', '/mail2-light.webp');
  });

  test('dispatches telemetry pings at 25%, 50%, 75%, and 100% completion milestones', async () => {
    const { container } = render(<HeroSection />);
    const video = container.querySelector('video') as HTMLVideoElement;

    Object.defineProperty(video, 'duration', { writable: true, value: 100 });

    // 1. Move to 25%
    Object.defineProperty(video, 'currentTime', { writable: true, value: 25 });
    fireEvent.timeUpdate(video);

    await waitFor(() => {
      expect(trackIntent).toHaveBeenCalledWith({
        client_id: 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0',
        aura_id: 'anonymous-hero-visitor',
        vsl_completion_percentage: 25,
      });
    });

    // 2. Move to 50%
    Object.defineProperty(video, 'currentTime', { writable: true, value: 50 });
    fireEvent.timeUpdate(video);

    await waitFor(() => {
      expect(trackIntent).toHaveBeenCalledWith({
        client_id: 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0',
        aura_id: 'anonymous-hero-visitor',
        vsl_completion_percentage: 50,
      });
    });

    // 3. Move to 75%
    Object.defineProperty(video, 'currentTime', { writable: true, value: 75 });
    fireEvent.timeUpdate(video);

    await waitFor(() => {
      expect(trackIntent).toHaveBeenCalledWith({
        client_id: 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0',
        aura_id: 'anonymous-hero-visitor',
        vsl_completion_percentage: 75,
      });
    });

    // 4. End video (100% completion)
    fireEvent.ended(video);

    await waitFor(() => {
      expect(trackIntent).toHaveBeenCalledWith({
        client_id: 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0',
        aura_id: 'anonymous-hero-visitor',
        vsl_completion_percentage: 100,
      });
    });

    // Assert End Card CTA displays Book Demo and Replay
    expect(screen.getByText('Ready to streamline operations and unlock cashflow?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /book demo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /replay/i })).toBeInTheDocument();
  });

  test('handles end card Book Demo CTA click by reporting false abandonment and redirecting', async () => {
    const { container } = render(<HeroSection />);
    const video = container.querySelector('video') as HTMLVideoElement;

    Object.defineProperty(video, 'duration', { writable: true, value: 100 });
    fireEvent.ended(video);

    const ctaBtn = await screen.findByRole('button', { name: /book demo/i });
    fireEvent.click(ctaBtn);

    await waitFor(() => {
      expect(trackIntent).toHaveBeenCalledWith({
        client_id: 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0',
        aura_id: 'anonymous-hero-visitor',
        vsl_completion_percentage: 100,
        vsl_abandoned: false,
      });
      expect(mockPush).toHaveBeenCalledWith('/book-demo');
    });
  });

  test('clicking Replay button resets video and restarts playback', async () => {
    const { container } = render(<HeroSection />);
    const video = container.querySelector('video') as HTMLVideoElement;
    const playSpy = jest.spyOn(video, 'play');

    Object.defineProperty(video, 'duration', { writable: true, value: 100 });
    fireEvent.ended(video);

    const replayBtn = await screen.findByRole('button', { name: /replay/i });
    fireEvent.click(replayBtn);

    expect(video.currentTime).toBe(0);
    expect(playSpy).toHaveBeenCalled();
  });
});
