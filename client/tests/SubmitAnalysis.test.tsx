import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import SubmitAnalysis from "../src/components/athletes/SubmitAnalysis";
import analyzeFields from "../src/utils/analyzeFields";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";

jest.mock("../src/utils/analyzeFields", () => ({
  __esModule: true,
  default: {
    TestAnalysis: [
      { label: "NumField", type: "number" },
      { label: "IntField", type: "integer" },
      { label: "TextField", type: "text" },
    ],
  },
}));

jest.mock("@tanstack/react-query");
const mockMutate = jest.fn();
jest.mock("axios");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

describe("SubmitAnalysis", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (useParams as jest.Mock).mockReturnValue({ assignment_id: "aid" });
    (useLocation as jest.Mock).mockReturnValue({
      state: { analyze_name: "TestAnalysis" },
    });
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it("вызывает mutate при сабмите", () => {
    const { container } = render(<SubmitAnalysis />);
    const form = container.querySelector("form")!;
    fireEvent.submit(form);
    expect(mockMutate).toHaveBeenCalled();
  });

  it("показывает модалку и навигирует после onSuccess", async () => {
    jest.useFakeTimers();

    let onSuccess: () => void = () => {};
    (useMutation as jest.Mock).mockImplementation((opts) => {
      onSuccess = opts.onSuccess!;
      return { mutate: () => onSuccess(), isPending: false };
    });

    const { container } = render(<SubmitAnalysis />);
    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText(/Анализ успешно отправлен!/i)
      ).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/my-analysis");
      expect(screen.queryByText(/Анализ успешно отправлен!/i)).toBeNull();
    });
    jest.useRealTimers();
  });

  it("отрисовывает ошибку при onError", async () => {
    let onError: (err: any) => void = () => {};
    (useMutation as jest.Mock).mockImplementation((opts) => {
      onError = opts.onError!;
      return {
        mutate: () =>
          onError({ response: { data: { message: "Server error" } } }),
        isPending: false,
      };
    });

    const { container } = render(<SubmitAnalysis />);
    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Server error/i)).toBeInTheDocument();
    });
  });
});
