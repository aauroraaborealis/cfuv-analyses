import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../src/components/Login";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, getRoleFromToken } from "../src/utils/auth";

jest.mock("axios");
jest.mock("@tanstack/react-query");
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));
jest.mock("../src/utils/auth");

describe("Login", () => {
  const mockNavigate = jest.fn();
  const mockMutate = jest.fn();
  beforeEach(() => {
    jest.resetAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    (isAuthenticated as jest.Mock).mockReturnValue(false);
    (getRoleFromToken as jest.Mock).mockReturnValue(null);
  });

  it("redirects to /analysis-results if already trainer", () => {
    (isAuthenticated as jest.Mock).mockReturnValue(true);
    (getRoleFromToken as jest.Mock).mockReturnValue("trainer");
    render(<Login />);
    expect(mockNavigate).toHaveBeenCalledWith("/analysis-results");
  });

  it("redirects to /my-analysis if already student", () => {
    (isAuthenticated as jest.Mock).mockReturnValue(true);
    (getRoleFromToken as jest.Mock).mockReturnValue("student");
    render(<Login />);
    expect(mockNavigate).toHaveBeenCalledWith("/my-analysis");
  });

  it("calls mutate with credentials on submit", () => {
    render(<Login />);
    const emailInput = document.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement;
    const passInput = document.querySelector(
      'input[type="password"]'
    ) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: "a@b.com" } });
    fireEvent.change(passInput, { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: /Войти/i }));
    expect(mockMutate).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "secret",
    });
  });

  it("navigates to verify on successful login", async () => {
    let onSuccess: () => void;
    (useMutation as jest.Mock).mockImplementation(({ onSuccess: os }) => {
      onSuccess = os!;
      return { mutate: () => onSuccess(), isPending: false };
    });
    render(<Login />);
    const emailInput = document.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement;
    const passInput = document.querySelector(
      'input[type="password"]'
    ) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: "x@y.com" } });
    fireEvent.change(passInput, { target: { value: "pwd" } });
    fireEvent.click(screen.getByRole("button", { name: /Войти/i }));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/login-verify", {
        state: { email: "x@y.com" },
      })
    );
  });

  it("displays error message on login failure", async () => {
    let onError: (err: any) => void;
    (useMutation as jest.Mock).mockImplementation(({ onError: oe }) => {
      onError = oe!;
      return {
        mutate: () => onError({ response: { data: { message: "Bad creds" } } }),
        isPending: false,
      };
    });
    render(<Login />);
    const emailInput = document.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement;
    const passInput = document.querySelector(
      'input[type="password"]'
    ) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: "u@v.com" } });
    fireEvent.change(passInput, { target: { value: "1234" } });
    fireEvent.click(screen.getByRole("button", { name: /Войти/i }));
    expect(await screen.findByText("Bad creds")).toBeInTheDocument();
  });
});
