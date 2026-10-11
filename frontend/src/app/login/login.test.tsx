import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginPage from "./page";
import { signIn } from "@/lib/auth-client";
import { ThemeProvider } from "@/context/ThemeContext";

jest.mock("@/icons", () => ({
  EyeCloseIcon: () => <svg data-testid="eye-close-icon" />,
  EyeIcon: () => <svg data-testid="eye-icon" />,
  GridIcon: () => <svg data-testid="grid-icon" />,
}));

jest.mock("@/lib/auth-client", () => ({
  signIn: {
    social: jest.fn(),
    email: jest.fn(),
  },
  useSession: jest.fn(() => ({ data: null, isPending: false })),
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, priority, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe("LoginPage Modernization & RBAC Auth Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders modern auth options: Google, GitHub, Microsoft, and email form", () => {
    renderWithTheme(<LoginPage />);

    expect(screen.getByRole("heading", { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /GitHub/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Microsoft/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByText(/Organization Access Only/i)).toBeInTheDocument();
  });

  test("clicking Google SSO triggers Better Auth signIn.social", async () => {
    (signIn.social as jest.Mock).mockResolvedValueOnce({ error: null });

    renderWithTheme(<LoginPage />);

    const googleBtn = screen.getByRole("button", { name: /Google/i });
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(signIn.social).toHaveBeenCalledWith({
        provider: "google",
        callbackURL: "/aurahq",
      });
    });
  });

  test("clicking GitHub SSO triggers Better Auth signIn.social with github", async () => {
    (signIn.social as jest.Mock).mockResolvedValueOnce({ error: null });

    renderWithTheme(<LoginPage />);

    const githubBtn = screen.getByRole("button", { name: /GitHub/i });
    fireEvent.click(githubBtn);

    await waitFor(() => {
      expect(signIn.social).toHaveBeenCalledWith({
        provider: "github",
        callbackURL: "/aurahq",
      });
    });
  });

  test("clicking Microsoft SSO triggers Better Auth signIn.social with microsoft", async () => {
    (signIn.social as jest.Mock).mockResolvedValueOnce({ error: null });

    renderWithTheme(<LoginPage />);

    const microsoftBtn = screen.getByRole("button", { name: /Microsoft/i });
    fireEvent.click(microsoftBtn);

    await waitFor(() => {
      expect(signIn.social).toHaveBeenCalledWith({
        provider: "microsoft",
        callbackURL: "/aurahq",
      });
    });
  });

  test("validates input and displays TailAdmin Alert error banner on empty email/password", async () => {
    renderWithTheme(<LoginPage />);

    const submitBtn = screen.getByRole("button", { name: "Sign In" });
    fireEvent.click(submitBtn);

    expect(screen.getByText("Authentication Error")).toBeInTheDocument();
    expect(screen.getByText("Please enter your organization email address.")).toBeInTheDocument();
    expect(signIn.email).not.toHaveBeenCalled();
  });

  test("displays TailAdmin Alert error banner when signIn.email returns failure", async () => {
    (signIn.email as jest.Mock).mockResolvedValueOnce({
      error: { message: "Invalid email or password." },
    });

    renderWithTheme(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/info@company\.co\.za/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);

    fireEvent.change(emailInput, { target: { value: "invalid@auraworks.co.za" } });
    fireEvent.change(passwordInput, { target: { value: "WrongPassword" } });

    const submitBtn = screen.getByRole("button", { name: "Sign In" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Authentication Error")).toBeInTheDocument();
      expect(screen.getByText("Invalid email or password.")).toBeInTheDocument();
    });
  });

  test("signs in with email/password and passes rememberMe parameter when checkbox is checked", async () => {
    (signIn.email as jest.Mock).mockResolvedValueOnce({ error: null });

    renderWithTheme(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/info@company\.co\.za/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);

    fireEvent.change(emailInput, { target: { value: "rep@auraworks.co.za" } });
    fireEvent.change(passwordInput, { target: { value: "SecurePassword123!" } });

    const submitBtn = screen.getByRole("button", { name: "Sign In" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(signIn.email).toHaveBeenCalledWith({
        email: "rep@auraworks.co.za",
        password: "SecurePassword123!",
        callbackURL: "/aurahq",
        rememberMe: true,
      });
    });
  });

  test("clicking Forgot password displays administrator guidance Alert", () => {
    renderWithTheme(<LoginPage />);

    const forgotBtn = screen.getByRole("button", { name: /Forgot password\?/i });
    fireEvent.click(forgotBtn);

    expect(screen.getByText("Account Recovery")).toBeInTheDocument();
    expect(
      screen.getByText(/contact your organization's system administrator to reset your credentials/i)
    ).toBeInTheDocument();
  });
});
