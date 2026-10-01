import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { ALERT_POOL } from "./data/simulation";

// Pin Math.random so the simulated data is deterministic: with 0.5 the alert
// generator always yields 4 alerts, and the 35%-chance alert regeneration on
// refresh never fires, so counts cannot drift mid-test.
beforeEach(() => vi.spyOn(Math, "random").mockReturnValue(0.5));
afterEach(() => vi.restoreAllMocks());

const EXPECTED_ALERTS = Math.floor(0.5 * (ALERT_POOL.length + 1 - 2) + 2);

describe("SupplyChainDashboard", () => {
  it("renders the shell with every nav entry and opens on the overview", async () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Supply Chain Intelligence Hub" })).toBeInTheDocument();
    for (const label of ["Overview", "Performance", "Inventory", "Shipments", "AI Insights", "Alerts"]) {
      expect(screen.getByRole("button", { name: new RegExp(`^${label}`) })).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: /^Overview/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByTestId("view-title")).toHaveTextContent("Overview Dashboard");

    // Views are lazy-loaded, so wait for the overview chunk to resolve.
    expect(await screen.findByText("On-Time Delivery")).toBeInTheDocument();
    expect(screen.getByText("Global Region Performance")).toBeInTheDocument();
  });

  it("switches views from the sidebar and updates the breadcrumb", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /^AI Insights/ }));
    expect(screen.getByTestId("view-title")).toHaveTextContent("AI-Powered Insights");
    expect(await screen.findByText("Demand Forecasting")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^AI Insights/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /^Overview/ })).not.toHaveAttribute("aria-current");

    await user.click(screen.getByRole("button", { name: /^Inventory/ }));
    expect(screen.getByTestId("view-title")).toHaveTextContent("Inventory Management");
    expect(await screen.findByText("Inventory by Category")).toBeInTheDocument();
  });

  it("shows the live alert count in the sidebar and drops it when an alert is dismissed", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByTestId("alert-count")).toHaveTextContent(String(EXPECTED_ALERTS));

    await user.click(screen.getByRole("button", { name: /^Alerts/ }));
    expect(await screen.findByText(`${EXPECTED_ALERTS} ACTIVE`)).toBeInTheDocument();
    const dismissButtons = screen.getAllByRole("button", { name: "x" });
    expect(dismissButtons).toHaveLength(EXPECTED_ALERTS);

    await user.click(dismissButtons[0]);
    expect(screen.getAllByRole("button", { name: "x" })).toHaveLength(EXPECTED_ALERTS - 1);
    expect(screen.getByText(`${EXPECTED_ALERTS - 1} ACTIVE`)).toBeInTheDocument();
    expect(screen.getByTestId("alert-count")).toHaveTextContent(String(EXPECTED_ALERTS - 1));
    expect(screen.queryByText(ALERT_POOL[0].message)).not.toBeInTheDocument();
  });

  it("renders a clock in the top bar", () => {
    render(<App />);
    expect(screen.getByTestId("clock")).toHaveTextContent(/\d/);
  });
});
