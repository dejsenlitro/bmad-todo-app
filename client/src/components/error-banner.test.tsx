import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBanner from "./error-banner";

describe("ErrorBanner", () => {
  it("renders the error message", () => {
    render(<ErrorBanner message="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("has role=alert for accessibility", () => {
    render(<ErrorBanner message="Error" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("shows the warning icon", () => {
    render(<ErrorBanner message="Error" />);
    expect(screen.getByText("⚠")).toBeInTheDocument();
  });
});
