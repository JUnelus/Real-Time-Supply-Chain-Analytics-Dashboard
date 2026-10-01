import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Truck } from "lucide-react";
import { KPICard, AlertItem, CustomTooltip, SectionHeader, RegionRow } from "./viewShared";

describe("KPICard", () => {
  const base = { title: "On-Time Delivery", value: 94.26, unit: "%", icon: Truck, accentColor: "#00e5ff" };

  it("renders the title, the value rounded to one decimal, and the unit", () => {
    render(<KPICard {...base} change={1.5} />);
    expect(screen.getByText("On-Time Delivery")).toBeInTheDocument();
    expect(screen.getByText("94.3")).toBeInTheDocument();
    expect(screen.getByText("%")).toBeInTheDocument();
  });

  it("shows a positive change in green", () => {
    render(<KPICard {...base} change={1.5} />);
    expect(screen.getByText("1.5%")).toHaveStyle({ color: "#00ffaa" });
  });

  it("shows a negative change as its magnitude in red", () => {
    render(<KPICard {...base} change={-2.4} />);
    expect(screen.getByText("2.4%")).toHaveStyle({ color: "#f87171" });
    expect(screen.queryByText("-2.4%")).not.toBeInTheDocument();
  });

  it("only mounts a sparkline when series data is provided", () => {
    const { container, rerender } = render(<KPICard {...base} change={0} />);
    expect(container.querySelector(".recharts-responsive-container")).toBeNull();
    rerender(<KPICard {...base} change={0} sparkData={[{ v: 1 }, { v: 2 }]} />);
    expect(container.querySelector(".recharts-responsive-container")).not.toBeNull();
  });
});

describe("AlertItem", () => {
  const alert = { id: "a1", type: "error", message: "Shipment delay on Route I-90", priority: "High", timestamp: "09:30:00 AM" };

  it("renders the message, priority, timestamp and the severity label for its type", () => {
    render(<AlertItem alert={alert} onDismiss={() => {}} />);
    expect(screen.getByText("Shipment delay on Route I-90")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("09:30:00 AM")).toBeInTheDocument();
    expect(screen.getByText("Critical")).toBeInTheDocument();
  });

  it("calls onDismiss with the alert id when the dismiss button is clicked", () => {
    const onDismiss = vi.fn();
    render(<AlertItem alert={alert} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith("a1");
  });

  it("falls back to the info style for an unknown alert type", () => {
    render(<AlertItem alert={{ ...alert, type: "bogus" }} onDismiss={() => {}} />);
    expect(screen.getByText("Info")).toBeInTheDocument();
  });
});

describe("CustomTooltip", () => {
  it("renders nothing when inactive or when there is no payload", () => {
    const { container, rerender } = render(<CustomTooltip active={false} payload={[{ name: "x", value: 1 }]} label="7" />);
    expect(container).toBeEmptyDOMElement();
    rerender(<CustomTooltip active payload={[]} label="7" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the label and one row per series with values to one decimal", () => {
    render(
      <CustomTooltip
        active
        label="14"
        payload={[
          { name: "On-Time %", value: 93.456, color: "#00ffaa" },
          { name: "Status", value: "Delayed", color: "#f87171" },
        ]}
      />
    );
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("On-Time %:")).toBeInTheDocument();
    expect(screen.getByText("93.5")).toBeInTheDocument();
    expect(screen.getByText("Delayed")).toBeInTheDocument();
  });
});

describe("SectionHeader", () => {
  it("renders the title and an optional badge", () => {
    const { rerender } = render(<SectionHeader title="Active Alerts" />);
    expect(screen.getByRole("heading", { name: "Active Alerts" })).toBeInTheDocument();
    expect(screen.queryByText("LIVE")).not.toBeInTheDocument();
    rerender(<SectionHeader title="Active Alerts" badge="LIVE" />);
    expect(screen.getByText("LIVE")).toBeInTheDocument();
  });
});

describe("RegionRow", () => {
  it("formats shipment counts and the on-time rate", () => {
    render(<RegionRow r={{ region: "Asia Pacific", shipments: 1580, onTime: 91.333, color: "#00ffaa" }} />);
    expect(screen.getByText("Asia Pacific")).toBeInTheDocument();
    expect(screen.getByText("1,580 shipments")).toBeInTheDocument();
    expect(screen.getByText("91.3%")).toBeInTheDocument();
  });
});
