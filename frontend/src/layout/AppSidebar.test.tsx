import React from "react";
import { render, screen } from "@testing-library/react";
import AppSidebar from "./AppSidebar";
import { useSession } from "@/lib/auth-client";

jest.mock("@/lib/auth-client", () => ({
  useSession: jest.fn(),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/context/SidebarContext", () => ({
  useSidebar: () => ({
    isExpanded: true,
    isMobileOpen: false,
    isHovered: false,
    setIsHovered: jest.fn(),
  }),
}));

jest.mock("@/i18n/navigation", () => ({
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

describe("AppSidebar Role-Scoped Navigation Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders all items including Admin Console for admin user", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: "admin-1",
          name: "Admin User",
          email: "admin@auraworks.ai",
          role: "admin",
        },
      },
    });

    render(<AppSidebar />);

    expect(screen.getByText("Admin Console")).toBeInTheDocument();
    expect(screen.getByText("Sales Portal")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Calendar")).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("User Profile")).toBeInTheDocument();

    const adminLink = screen.getByText("Admin Console").closest("a");
    expect(adminLink).toHaveAttribute("href", "/aurahq/admin");

    const salesLink = screen.getByText("Sales Portal").closest("a");
    expect(salesLink).toHaveAttribute("href", "/aurahq/sales");
  });

  test("hides Admin Console and renders only permitted items for sales rep", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: "rep-1",
          name: "Sales Rep",
          email: "rep@auraworks.ai",
          role: "sales",
        },
      },
    });

    render(<AppSidebar />);

    expect(screen.queryByText("Admin Console")).not.toBeInTheDocument();
    expect(screen.getByText("Sales Portal")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Calendar")).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("User Profile")).toBeInTheDocument();
  });
});
