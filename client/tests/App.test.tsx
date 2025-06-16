import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../src/App";

jest.mock("../src/components/Header", () => () => (
  <div data-testid="header">HeaderMock</div>
));
jest.mock("../src/components/AppRoutes", () => () => (
  <div data-testid="routes">RoutesMock</div>
));

describe("App component", () => {
  it("renders Header and AppRoutes inside a Router", () => {
    render(<App />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("routes")).toBeInTheDocument();
  });

  it("matches snapshot", () => {
    const { asFragment } = render(<App />);
    expect(asFragment()).toMatchSnapshot();
  });
});
