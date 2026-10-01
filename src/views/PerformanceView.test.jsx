import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PerformanceView from "./PerformanceView";

const perf = Array.from({ length: 24 }, (_, hour) => ({ hour, onTime: 94, accuracy: 98, efficiency: 85 }));
const demand = Array.from({ length: 24 }, (_, hour) => ({ hour, orders: 300 + hour, level: 1 }));

describe("PerformanceView", () => {
  it("renders the two performance charts", () => {
    render(<PerformanceView performanceData={perf} />);
    expect(screen.getByText("24-Hour Performance Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Hourly Efficiency Comparison")).toBeInTheDocument();
  });

  it("adds the order volume and forecast chart only when demand data is present", () => {
    const { rerender } = render(<PerformanceView performanceData={perf} />);
    expect(screen.queryByText(/Order Volume & 6-Hour Forecast/)).not.toBeInTheDocument();

    rerender(<PerformanceView performanceData={perf} demandData={demand} />);
    expect(screen.getByText("Order Volume & 6-Hour Forecast")).toBeInTheDocument();
    expect(screen.getByText("LIVE")).toBeInTheDocument();
  });
});
