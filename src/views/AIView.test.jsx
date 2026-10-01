import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import AIView from "./AIView";

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

  it("keeps the other five insights and tags them as samples", () => {
    render(<AIView performanceData={series()} />);
    for (const title of ["Demand Forecasting", "Route Optimization", "Customer Behavior", "Inventory Prediction", "Cost Optimization"]) {
      const card = screen.getByText(title).closest(".glass");
      expect(within(card).getByTestId("insight-source")).toHaveTextContent("SAMPLE");
    }
    expect(screen.getAllByTestId("insight-source").filter((el) => el.textContent === "LIVE")).toHaveLength(1);
    expect(screen.getByText("Model Performance Metrics")).toBeInTheDocument();
  });
});
