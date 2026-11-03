import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import RecentOrders from "./RecentOrders";

jest.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    return (key: string, values?: any) => {
      const translations: Record<string, string> = {
        title: "Recent Orders",
        products: "Products",
        category: "Category",
        price: "Price",
        status: "Status",
        duration: `${values?.count || 1} Month`,
        filter: "Filter",
        seeAll: "See all",
        "categories.seo": "Technical SEO Audit",
        "categories.geo": "Generative Engine Optimization",
        "categories.identity": "Visitor Identity Resolution",
        "categories.retainer": "Full-Service Pipeline Retainer",
        "statuses.delivered": "Delivered",
        "statuses.pending": "Pending",
        "statuses.canceled": "Canceled",
      };
      return translations[key] || key;
    };
  },
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

describe("RecentOrders Table Alignment Tests", () => {
  test("renders correct column headers in order: Products, Category, Price, Status", () => {
    render(<RecentOrders />);

    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(4);
    expect(headers[0]).toHaveTextContent("Products");
    expect(headers[1]).toHaveTextContent("Category");
    expect(headers[2]).toHaveTextContent("Price");
    expect(headers[3]).toHaveTextContent("Status");
  });

  test("renders body row cells matching column headers (Category in col 2, Price in col 3)", () => {
    render(<RecentOrders />);

    // Get table rows in tbody
    const rows = screen.getAllByRole("row");
    // Row 0 is header row, Row 1 is first product row
    const firstDataRow = rows[1];
    const cells = firstDataRow.querySelectorAll("td");

    expect(cells).toHaveLength(4);
    // Col 0: Product Info (Technical SEO Audit)
    expect(cells[0]).toHaveTextContent("Technical SEO Audit");
    // Col 1: Category (Technical SEO Audit category)
    expect(cells[1]).toHaveTextContent("Technical SEO Audit");
    // Col 2: Price ($2,500.00)
    expect(cells[2]).toHaveTextContent("$2,500.00");
    // Col 3: Status (Delivered)
    expect(cells[3]).toHaveTextContent("Delivered");
  });
});
