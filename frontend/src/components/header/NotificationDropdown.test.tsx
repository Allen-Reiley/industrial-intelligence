import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NotificationDropdown, { NotificationItem } from "./NotificationDropdown";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    if (key === "title") return "Notifications";
    return key;
  },
}));

describe("NotificationDropdown Component Tests", () => {
  test("renders clean empty state by default without mock users", () => {
    render(<NotificationDropdown />);

    const trigger = screen.getByRole("button", { name: /notifications/i });
    fireEvent.click(trigger);

    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("No new notifications")).toBeInTheDocument();
    expect(screen.queryByText("Terry Franci")).not.toBeInTheDocument();
    expect(screen.queryByText("Brandon Philips")).not.toBeInTheDocument();
  });

  test("renders real notification items when present and allows marking as read", () => {
    const testNotifications: NotificationItem[] = [
      {
        id: "notif-1",
        title: "Checkout Succeeded",
        message: "Customer paid $500 via dynamic link",
        time: "Just now",
        read: false,
      },
    ];

    render(<NotificationDropdown initialNotifications={testNotifications} />);

    const trigger = screen.getByRole("button", { name: /notifications/i });
    fireEvent.click(trigger);

    expect(screen.getByText("Checkout Succeeded")).toBeInTheDocument();
    expect(screen.getByText("Customer paid $500 via dynamic link")).toBeInTheDocument();
    expect(screen.getByText("1 new")).toBeInTheDocument();

    const markReadBtn = screen.getByRole("button", { name: /mark all read/i });
    fireEvent.click(markReadBtn);

    expect(screen.queryByText("1 new")).not.toBeInTheDocument();
  });
});
