import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import AIView from "./AIView";
import { DAILY_DEMAND_PROFILE } from "../data/analytics";

const series = (overrides = {}) => Array.from({ length: 24 }, (_, hour) => ({ hour, onTime: overrides[hour] ?? 94 + (hour % 3) }));

const anomalyCard = () => screen.getByText("Anomaly Detection").closest(".glass");

describe("AIView", () => {
  it("computes the Anomaly Detection card from the live series and flags a dip", () => {
    render(<AIView performanceData={series({ 14: 80 })} />);

    const card = anomalyCard();
    expect(within(card).getByTestId("insight-source")).toHaveTextContent("LIVE");
    expect(within(card).getByText(/dropped to 80\.0% at 14:00/)).toBeInTheDocument();
    expect(within(card).getByText("Review carrier and route performance for hour 14:00")).toBeInTheDocument();
    expect(within(card).getByText(/% anomaly score$/)).toBeInTheDocument();

    const stats = within(card).getByTestId("insight-stats");
    expect(stats).toHaveTextContent("flagged 1/24");
    expect(stats).toHaveTextContent("mean");
    expect(stats).toHaveTextContent("σ");
  });

  it("reports a quiet series as normal with no action required", () => {
    render(<AIView performanceData={series()} />);
    const card = anomalyCard();
    expect(within(card).getByText(/All 24 hours of on-time delivery sit within 2σ/)).toBeInTheDocument();
    expect(within(card).getByText(/No intervention needed/)).toBeInTheDocument();
    expect(within(card).getByTestId("insight-stats")).toHaveTextContent("flagged 0/24");
  });

  it("falls back to the sample card when there is no series yet", () => {
    render(<AIView performanceData={[]} />);
    const card = anomalyCard();
    expect(within(card).getByTestId("insight-source")).toHaveTextContent("SAMPLE");
    expect(within(card).getByText(/340% above baseline/)).toBeInTheDocument();
  });

  it("keeps the other five insights as samples when only the series is live", () => {
    render(<AIView performanceData={series()} />);
    for (const title of ["Demand Forecasting", "Route Optimization", "Customer Behavior", "Inventory Prediction", "Cost Optimization"]) {
      const card = screen.getByText(title).closest(".glass");
      expect(within(card).getByTestId("insight-source")).toHaveTextContent("SAMPLE");
    }
    expect(screen.getAllByTestId("insight-source").filter((el) => el.textContent === "LIVE")).toHaveLength(1);
    expect(screen.getByText("Model Performance Metrics")).toBeInTheDocument();
  });

  describe("Inventory Prediction", () => {
    // Books burns 12/day (600 x 7.3 / 365) -> reorder point 252 over the default 21-day window.
    const inventory = (booksCurrent) => [
      { category: "Books", current: booksCurrent, optimal: 600, turnover: "7.3" },
      { category: "Sports", current: 300, optimal: 400, turnover: "3.65" },
    ];
    const reorderCard = () => screen.getByText("Inventory Prediction").closest(".glass");

    it("computes the card from inventory and flags a category below its reorder point", () => {
      render(<AIView performanceData={series()} inventoryData={inventory(200)} />);
      const card = reorderCard();
      expect(within(card).getByTestId("insight-source")).toHaveTextContent("LIVE");
      expect(within(card).getByText(/Books holds 200 units against a burn rate of 12\.0\/day/)).toBeInTheDocument();
      expect(within(card).getByText("Order 400 units of Books to restore optimal stock")).toBeInTheDocument();
      expect(within(card).getByText(/50% above reorder point/)).toBeInTheDocument();
      expect(within(card).getByTestId("insight-stats")).toHaveTextContent("to reorder 1/2");
      expect(screen.getAllByTestId("insight-source").filter((el) => el.textContent === "LIVE")).toHaveLength(2);
    });

    it("reports all-clear with the tightest category when stock is healthy", () => {
      render(<AIView performanceData={series()} inventoryData={inventory(480)} />);
      const card = reorderCard();
      expect(within(card).getByText(/All 2 categories sit above their reorder points/)).toBeInTheDocument();
      expect(within(card).getByText(/No purchase orders needed - reorder Books once it drops to 252 units/)).toBeInTheDocument();
      expect(within(card).getByText(/100% above reorder point/)).toBeInTheDocument();
    });

    it("falls back to the sample card without inventory data", () => {
      render(<AIView performanceData={series()} inventoryData={[]} />);
      const card = reorderCard();
      expect(within(card).getByTestId("insight-source")).toHaveTextContent("SAMPLE");
      expect(within(card).getByText(/stockout risk for Automotive parts/)).toBeInTheDocument();
    });
  });
});

describe("AIView demand forecasting", () => {
  const series = () => Array.from({ length: 24 }, (_, hour) => ({ hour, onTime: 94 }));
  // Exact rising level shaped by the daily profile -> near-perfect deseasonalised
  // fit. The window ends at 05:00 so the forecast covers the 06:00-11:00 ramp.
  const demand = (slope) =>
    Array.from({ length: 24 }, (_, i) => {
      const hour = (6 + i) % 24;
      return { hour, orders: Math.round((300 + slope * i) * DAILY_DEMAND_PROFILE[hour]) };
    });
  const demandCard = () => screen.getByText("Demand Forecasting").closest(".glass");

  it("computes the Demand Forecasting card from the order series", () => {
    render(<AIView performanceData={series()} demandData={demand(4)} />);
    const card = demandCard();
    expect(within(card).getByTestId("insight-source")).toHaveTextContent("LIVE");
    expect(within(card).getByText(/Seasonally adjusted order volume is trending \+\d\.\d% per hour/)).toBeInTheDocument();
    expect(within(card).getByText(/% trend fit \(R²\)$/)).toBeInTheDocument();
    const stats = within(card).getByTestId("insight-stats");
    expect(stats).toHaveTextContent("trend");
    expect(stats).toHaveTextContent("next 6h");
    expect(stats).toHaveTextContent(/peak \d+ @ \d\d:00/);
    expect(screen.getAllByTestId("insight-source").filter((el) => el.textContent === "LIVE")).toHaveLength(2);
  });

  it("recommends extra capacity when volume is rising into the morning ramp", () => {
    render(<AIView performanceData={series()} demandData={demand(4)} />);
    expect(within(demandCard()).getByText(/Add pick-pack capacity ahead of/)).toBeInTheDocument();
  });

  it("falls back to the sample card without demand data", () => {
    render(<AIView performanceData={series()} demandData={[]} />);
    const card = demandCard();
    expect(within(card).getByTestId("insight-source")).toHaveTextContent("SAMPLE");
    expect(within(card).getByText(/23% increase in Electronics demand/)).toBeInTheDocument();
  });
});
