import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AssignAnalysis from "../src/components/trainers/AssignAnalysis";
import { toast } from "react-toastify";

jest.mock("@tanstack/react-query");
jest.mock("axios");
jest.mock("../src/utils/fetch");
jest.mock(
  "../src/components/shared/SuccessModal",
  () =>
    ({ message, onClose }: any) => (
      <div role="dialog">
        <span>{message}</span>
        <button onClick={onClose}>Close</button>
      </div>
    )
);
jest.mock("react-toastify", () => ({
  toast: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe("AssignAnalysis", () => {
  const analyzes = [
    { value: "a1", label: "Glucose" },
    { value: "a2", label: "Cholesterol" },
  ];
  const sports = [
    { value: "s1", label: "Football" },
    { value: "s2", label: "Basketball" },
  ];
  const teams = [
    { value: "t1", label: "Team A" },
    { value: "t2", label: "Team B" },
  ];
  const students = [
    { value: "u1", label: "Ivanov Ivan" },
    { value: "u2", label: "Petrov Petr" },
  ];

  let mockMutate: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();

    (useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
      switch (queryKey[0]) {
        case "analyzes":
          return { data: analyzes, isLoading: false };
        case "sports":
          return { data: sports, isLoading: false };
        case "teams":
          return { data: teams, isFetching: false };
        case "students":
          return { data: students, isFetching: false };
        default:
          return { data: [], isLoading: false };
      }
    });

    mockMutate = jest.fn();

    (useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    Storage.prototype.getItem = jest.fn(() => "fake-token");
  });

  it("submits correct payload when all fields are filled (team)", async () => {
    render(<AssignAnalysis />);

    fireEvent.keyDown(screen.getByText("Выберите анализ"), {
      key: "ArrowDown",
    });
    await waitFor(() => screen.getByText("Glucose"));
    fireEvent.click(screen.getByText("Glucose"));

    fireEvent.keyDown(screen.getByText("Выберите вид спорта"), {
      key: "ArrowDown",
    });
    await waitFor(() => screen.getByText("Football"));
    fireEvent.click(screen.getByText("Football"));

    fireEvent.keyDown(screen.getByText("Выберите команду"), {
      key: "ArrowDown",
    });
    await waitFor(() => screen.getByText("Team A"));
    fireEvent.click(screen.getByText("Team A"));

    const dateInput = document.querySelector(
      'input[type="date"]'
    ) as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2025-07-01" } });

    fireEvent.click(screen.getByRole("button", { name: /Назначить анализ/i }));

    expect(mockMutate).toHaveBeenCalledWith({
      analyze_id: "a1",
      sport_id: "s1",
      team_id: "t1",
      student_id: null,
      due_date: "2025-07-01",
    });
  });

  it("submits correct payload when assigning to student", async () => {
    render(<AssignAnalysis />);

    fireEvent.keyDown(screen.getByText("Выберите анализ"), {
      key: "ArrowDown",
    });
    await waitFor(() => screen.getByText("Cholesterol"));
    fireEvent.click(screen.getByText("Cholesterol"));

    fireEvent.keyDown(screen.getByText("Выберите вид спорта"), {
      key: "ArrowDown",
    });
    await waitFor(() => screen.getByText("Basketball"));
    fireEvent.click(screen.getByText("Basketball"));

    fireEvent.click(screen.getByLabelText(/Спортсмену/i));

    fireEvent.keyDown(screen.getByText("Выберите спортсмена"), {
      key: "ArrowDown",
    });
    await waitFor(() => screen.getByText("Petrov Petr"));
    fireEvent.click(screen.getByText("Petrov Petr"));

    const dateInput = document.querySelector(
      'input[type="date"]'
    ) as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2025-08-02" } });

    fireEvent.click(screen.getByRole("button", { name: /Назначить анализ/i }));

    expect(mockMutate).toHaveBeenCalledWith({
      analyze_id: "a2",
      sport_id: "s2",
      team_id: null,
      student_id: "u2",
      due_date: "2025-08-02",
    });
  });

  it("shows success modal on successful assignment", () => {
    render(<AssignAnalysis />);
    const { onSuccess } = (useMutation as jest.Mock).mock.calls[0][0];
    act(() => {
      onSuccess();
    });
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Анализ успешно назначен!"
    );
  });

  it('shows "Загрузка..." placeholder while loading analyzes', () => {
    (useQuery as jest.Mock).mockImplementationOnce(() => ({
      data: [],
      isLoading: true,
    }));
    render(<AssignAnalysis />);

    expect(screen.getByText("Загрузка...")).toBeInTheDocument();
  });

  it("shows toast.error on mutation error", () => {
    render(<AssignAnalysis />);

    const mutationOpts = (useMutation as jest.Mock).mock.calls[0][0];
    act(() => {
      mutationOpts.onError({ response: { data: { message: "Bad" } } });
    });
    expect(toast.error).toHaveBeenCalledWith("Ошибка: Bad");
  });
});
