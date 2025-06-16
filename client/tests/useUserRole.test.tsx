import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { jwtDecode } from "jwt-decode";
import useUserRole from "../src/hooks/useUserRole";

jest.mock("jwt-decode");

function TestComponent() {
  const role = useUserRole();
  return <div data-testid="role">{role}</div>;
}

describe("useUserRole hook", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("returns null when no token in localStorage", () => {
    render(<TestComponent />);
    expect(screen.getByTestId("role").textContent).toBe("");
  });

  it("returns the role when token is valid", () => {
    const fakeToken = "fake.jwt.token";
    localStorage.setItem("token", fakeToken);
    (jwtDecode as jest.Mock).mockReturnValue({ role: "trainer" });

    render(<TestComponent />);
    expect(jwtDecode).toHaveBeenCalledWith(fakeToken);
    expect(screen.getByTestId("role").textContent).toBe("trainer");
  });

  it("returns null and logs error when jwtDecode throws", () => {
    const fakeToken = "bad.token";
    localStorage.setItem("token", fakeToken);
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    (jwtDecode as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    render(<TestComponent />);
    expect(jwtDecode).toHaveBeenCalledWith(fakeToken);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Ошибка декодирования токена:",
      expect.any(Error)
    );
    expect(screen.getByTestId("role").textContent).toBe("");
  });
});
