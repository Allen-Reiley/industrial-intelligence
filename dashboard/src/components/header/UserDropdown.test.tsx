import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserDropdown from "./UserDropdown";
import { useSession, signOut } from "@/lib/auth-client";

jest.mock("@/lib/auth-client", () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      editProfile: "Edit profile",
      accountSettings: "Account settings",
      support: "Support",
      language: "Language",
      signOut: "Sign out",
    };
    return translations[key] || key;
  },
  useLocale: () => "en",
}));

jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  usePathname: () => "/aurahq/sales",
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, priority, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe("UserDropdown Component Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("displays active session profile details", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: "u-123",
          name: "Sarah Connor",
          email: "sarah@auraworks.ai",
          role: "admin",
          image: "/images/user/owner.png",
        },
      },
    });

    render(<UserDropdown />);

    expect(screen.getByText("Sarah")).toBeInTheDocument();

    const trigger = screen.getByRole("button", { name: /user menu/i });
    fireEvent.click(trigger);

    expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
    expect(screen.getByText("sarah@auraworks.ai")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();

    const profileLinks = screen.getAllByRole("link");
    const editProfileLink = profileLinks.find((l) => l.textContent?.includes("Edit profile"));
    expect(editProfileLink).toHaveAttribute("href", "/aurahq/profile");
  });

  test("invokes authClient.signOut on Sign out button click", async () => {
    const mockSignOut = signOut as jest.Mock;
    mockSignOut.mockImplementation(({ fetchOptions }: any) => {
      if (fetchOptions?.onSuccess) fetchOptions.onSuccess();
      return Promise.resolve();
    });

    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: "u-123",
          name: "Sarah Connor",
          email: "sarah@auraworks.ai",
          role: "sales",
        },
      },
    });

    render(<UserDropdown />);

    const trigger = screen.getByRole("button", { name: /user menu/i });
    fireEvent.click(trigger);

    const signOutBtn = screen.getByRole("button", { name: /sign out/i });
    expect(signOutBtn).toBeInTheDocument();

    fireEvent.click(signOutBtn);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});
