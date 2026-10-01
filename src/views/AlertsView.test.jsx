import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AlertsView from "./AlertsView";

const mk = (id, type) => ({ id, type, message: `Alert ${id}`, priority: "High", timestamp: "09:00:00 AM" });

describe("AlertsView", () => {
  it("shows a count tile per severity and the total in the header badge", () => {
    const alerts = [mk("1", "error"), mk("2", "error"), mk("3", "warning"), mk("4", "success")];
    render(<AlertsView alerts={alerts} onDismiss={() => {}} />);

    const tile = (label) => screen.getByText(label).previousSibling.textContent;
    expect(tile("Critical Alerts")).toBe("2");
    expect(tile("Warning Alerts")).toBe("1");
    expect(tile("Info Alerts")).toBe("0");
    expect(tile("Success Alerts")).toBe("1");
    expect(screen.getByText("4 ACTIVE")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(4);
  });

  it("renders the empty state when there are no alerts", () => {
    render(<AlertsView alerts={[]} onDismiss={() => {}} />);
    expect(screen.getByText("All systems operational - no active alerts")).toBeInTheDocument();
    expect(screen.getByText("0 ACTIVE")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("forwards dismissals with the id of the clicked alert", () => {
    const onDismiss = vi.fn();
    render(<AlertsView alerts={[mk("first", "info"), mk("second", "warning")]} onDismiss={onDismiss} />);
    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(onDismiss).toHaveBeenCalledWith("second");
  });
});
