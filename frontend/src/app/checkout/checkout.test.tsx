import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CheckoutPage from "./page";

// Mock next/navigation
const mockPush = jest.fn();
const mockGet = jest.fn().mockReturnValue("test-client-uuid");
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

describe("CheckoutPage Component Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes("ipify.org")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ip: "127.0.0.1" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          status: "success",
          intent_id: "ik_intent_123",
          payment_url: "https://gateway.ikhokha.com/checkout/ik_intent_123",
          amount: 1000000,
        }),
      });
    });
  });

  test("renders checkout elements correctly", () => {
    render(<CheckoutPage />);
    
    expect(screen.getByText("AuraWorks Billing Activation")).toBeInTheDocument();
    expect(screen.getByText("Enterprise Subscription")).toBeInTheDocument();
    expect(screen.getByText("R10,000")).toBeInTheDocument();
    expect(screen.getByTestId("tc-checkbox")).toBeInTheDocument();
    
    const submitBtn = screen.getByRole("button", { name: /Start Free 14-Day Trial/i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
  });

  test("toggling billing cycle updates price details", () => {
    render(<CheckoutPage />);
    
    expect(screen.getByText("R10,000")).toBeInTheDocument();
    
    const annualBtn = screen.getByTestId("toggle-annual");
    fireEvent.click(annualBtn);
    
    expect(screen.getByText("R120,000")).toBeInTheDocument();
    
    const monthlyBtn = screen.getByTestId("toggle-monthly");
    fireEvent.click(monthlyBtn);
    
    expect(screen.getByText("R10,000")).toBeInTheDocument();
  });

  test("accepting Terms & Conditions enables submit button", () => {
    render(<CheckoutPage />);
    
    const checkbox = screen.getByTestId("tc-checkbox");
    const submitBtn = screen.getByRole("button", { name: /Start Free 14-Day Trial/i });
    
    expect(submitBtn).toBeDisabled();
    
    fireEvent.click(checkbox);
    
    expect(submitBtn).toBeEnabled();
    
    fireEvent.click(checkbox);
    
    expect(submitBtn).toBeDisabled();
  });

  test("handles successful checkout and redirects to payment URL", async () => {
    render(<CheckoutPage />);

    // Accept T&C
    fireEvent.click(screen.getByTestId("tc-checkbox"));
    
    // Submit Form
    fireEvent.click(screen.getByRole("button", { name: /Start Free 14-Day Trial/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/billing/setup"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: expect.any(String),
        })
      );
    });

    const fetchCall = (global.fetch as jest.Mock).mock.calls.find(call => call[0].includes("/api/v1/billing/setup"));
    expect(fetchCall).toBeDefined();
    const requestBody = JSON.parse(fetchCall[1].body);
    expect(requestBody.client_id).toBe("test-client-uuid");
    expect(requestBody.billing_cycle).toBe("monthly");
    expect(requestBody.tc_accepted).toBe(true);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("https://gateway.ikhokha.com/checkout/ik_intent_123");
    });
  });

  test("handles API error and displays alert message", async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("ipify.org")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ip: "127.0.0.1" }),
        });
      }
      return Promise.resolve({
        ok: false,
        json: async () => ({
          detail: "Validation failed: invalid client uuid",
        }),
      });
    });

    render(<CheckoutPage />);

    fireEvent.click(screen.getByTestId("tc-checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Start Free 14-Day Trial/i }));

    await waitFor(() => {
      expect(screen.getByText("Validation failed: invalid client uuid")).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
