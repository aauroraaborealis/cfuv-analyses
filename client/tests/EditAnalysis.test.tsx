import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import EditAnalysis from "../src/components/trainers/EditAnalysis";

jest.mock("@tanstack/react-query");
jest.mock("axios");
jest.mock("../src/utils/fetch");
jest.mock(
  "../src/components/shared/SuccessModal",
  () =>
    ({ message, onClose }: any) => (
      <div role="dialog">
        {message}
        <button onClick={onClose}>X</button>
      </div>
    )
);

jest.mock("react-toastify", () => ({
  toast: { error: jest.fn() },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

describe("EditAnalysis", () => {
  const initialData = {
    analyze_id: "a1",
    analyze_name: "Glucose",
    scheduled_date: "2025-06-15T12:00:00Z",
    sport_id: "s1",
    sport_name: "Football",
    assigned_to_team: true,
    team_id: "t1",
    team_name: "Team A",
    student_id: null,
    student_first_name: null,
    student_last_name: null,
  };

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

  let mockUpdateMutate: jest.Mock;
  let mockDeleteMutate: jest.Mock;
  let updateCallbacks: { onSuccess?: () => void; onError?: (err: any) => void };
  let deleteCallbacks: { onSuccess?: () => void; onError?: (err: any) => void };
  let onClose: jest.Mock;
  let onFullClose: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();

    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: jest.fn(),
    });

    (useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
      if (queryKey[0] === "analysisDetails") {
        return { data: initialData, isLoading: false };
      }
      if (queryKey[0] === "analyzes") {
        return { data: analyzes, isLoading: false };
      }
      if (queryKey[0] === "sports") {
        return { data: sports, isLoading: false };
      }
      if (queryKey[0] === "teams") {
        return { data: teams, isFetching: false };
      }
      if (queryKey[0] === "students") {
        return { data: students, isFetching: false };
      }
      return { data: [], isLoading: false };
    });

    updateCallbacks = {};
    deleteCallbacks = {};
    mockUpdateMutate = jest.fn();
    mockDeleteMutate = jest.fn();
    (useMutation as jest.Mock).mockImplementation((options) => {
      if (options.mutationFn.length === 1) {
        updateCallbacks.onSuccess = options.onSuccess;
        updateCallbacks.onError = options.onError;
        return { mutate: mockUpdateMutate, isPending: false };
      } else {
        deleteCallbacks.onSuccess = options.onSuccess;
        deleteCallbacks.onError = options.onError;
        return { mutate: mockDeleteMutate, isPending: false };
      }
    });

    onClose = jest.fn();
    onFullClose = jest.fn();
  });

  it("shows loading text when initialData is loading", () => {
    (useQuery as jest.Mock).mockImplementationOnce(() => ({
      data: null,
      isLoading: true,
    }));
    render(
      <EditAnalysis
        assignmentId="x"
        onClose={onClose}
        onFullClose={onFullClose}
      />
    );
    expect(screen.getByText(/Загрузка данных/i)).toBeInTheDocument();
  });

  it("populates form from initialData and calls onClose", async () => {
    render(
      <EditAnalysis
        assignmentId="a1"
        onClose={onClose}
        onFullClose={onFullClose}
      />
    );

    await screen.findByText("Glucose");

    expect(screen.getByText("Glucose")).toBeInTheDocument();

    expect(screen.getByText("Football")).toBeInTheDocument();

    expect(screen.getByText("Team A")).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("2025-06-15") as HTMLInputElement
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Закрыть/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("submits updated values when Save is clicked", async () => {
    render(
      <EditAnalysis
        assignmentId="a1"
        onClose={onClose}
        onFullClose={onFullClose}
      />
    );

    await screen.findByText("Glucose");

    const analyzeInput = screen.getAllByRole("combobox")[0];
    fireEvent.keyDown(analyzeInput, { key: "ArrowDown" });
    await waitFor(() => screen.getByText("Cholesterol"));
    fireEvent.click(screen.getByText("Cholesterol"));

    const dateInput = screen.getByDisplayValue(
      "2025-06-15"
    ) as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2025-07-01" } });

    fireEvent.click(
      screen.getByRole("button", { name: /Сохранить изменения/i })
    );

    expect(mockUpdateMutate).toHaveBeenCalledWith({
      analyze_id: "a2",
      sport_id: "s1",
      team_id: "t1",
      student_id: null,
      due_date: "2025-07-01",
    });
  });

  it("calls deleteMutation when Удалить анализ is clicked", async () => {
    render(
      <EditAnalysis
        assignmentId="a1"
        onClose={onClose}
        onFullClose={onFullClose}
      />
    );

    await waitFor(() =>
      screen.getByRole("button", { name: /Удалить анализ/i })
    );
    fireEvent.click(screen.getByRole("button", { name: /Удалить анализ/i }));
    expect(mockDeleteMutate).toHaveBeenCalled();
  });

  it("validates required fields and shows error toast", async () => {
    const { container } = render(
      <EditAnalysis
        assignmentId="a1"
        onClose={onClose}
        onFullClose={onFullClose}
      />
    );

    await screen.findByText("Glucose");

    const dateInput = screen.getByDisplayValue(
      "2025-06-15"
    ) as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "" } });

    const form = container.querySelector("form")!;
    fireEvent.submit(form);
    expect(toast.error).toHaveBeenCalledWith("Заполните все поля!");
  });

  it("switches to student mode when radio clicked", async () => {
    render(
      <EditAnalysis
        assignmentId="a1"
        onClose={onClose}
        onFullClose={onFullClose}
      />
    );
    await screen.findByText("Glucose");
    fireEvent.click(screen.getByLabelText(/Спортсмену/i));

    expect(screen.getByText("Выберите спортсмена")).toBeInTheDocument();
  });

  it("submits update and shows success modal on onSuccess", async () => {
    render(
      <EditAnalysis
        assignmentId="a1"
        onClose={onClose}
        onFullClose={onFullClose}
      />
    );
    await screen.findByText("Glucose");

    const analyzeCombo = screen.getAllByRole("combobox")[0];
    fireEvent.keyDown(analyzeCombo, { key: "ArrowDown" });
    await waitFor(() => screen.getByText("Cholesterol"));
    fireEvent.click(screen.getByText("Cholesterol"));

    const dateInput = screen.getByDisplayValue(
      "2025-06-15"
    ) as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2025-07-01" } });

    fireEvent.click(
      screen.getByRole("button", { name: /Сохранить изменения/i })
    );
    expect(mockUpdateMutate).toHaveBeenCalledWith({
      analyze_id: "a2",
      sport_id: "s1",
      team_id: "t1",
      student_id: null,
      due_date: "2025-07-01",
    });

    act(() => updateCallbacks.onSuccess!());
    expect(await screen.findByRole("dialog")).toHaveTextContent(
      "Анализ успешно обновлён!"
    );
  });

  it("shows toast.error on update error", async () => {
    render(
      <EditAnalysis
        assignmentId="a1"
        onClose={onClose}
        onFullClose={onFullClose}
      />
    );
    await screen.findByText("Glucose");

    act(() =>
      updateCallbacks.onError!({ response: { data: { message: "Fail!" } } })
    );
    expect(toast.error).toHaveBeenCalledWith(
      "Ошибка обновления анализа: Fail!"
    );
  });

  it("submits delete and shows delete success modal", async () => {
    render(
      <EditAnalysis
        assignmentId="a1"
        onClose={onClose}
        onFullClose={onFullClose}
      />
    );
    await screen.findByRole("button", { name: /Удалить анализ/i });

    fireEvent.click(screen.getByRole("button", { name: /Удалить анализ/i }));
    expect(mockDeleteMutate).toHaveBeenCalled();

    act(() => deleteCallbacks.onSuccess!());
    expect(await screen.findByRole("dialog")).toHaveTextContent(
      "Анализ успешно удалён!"
    );
  });

  it("shows loading text when initialData is loading", () => {
    (useQuery as jest.Mock).mockImplementationOnce(() => ({
      data: null,
      isLoading: true,
    }));
    render(
      <EditAnalysis
        assignmentId="x"
        onClose={onClose}
        onFullClose={onFullClose}
      />
    );
    expect(screen.getByText(/Загрузка данных/)).toBeInTheDocument();
  });

  it("triggers update onSuccess and shows modal", async () => {
    render(
      <EditAnalysis
        assignmentId="a1"
        onClose={onClose}
        onFullClose={onFullClose}
      />
    );
    await screen.findByText("Glucose");
    fireEvent.click(
      screen.getByRole("button", { name: /Сохранить изменения/ })
    );
    act(() => updateCallbacks.onSuccess());
    expect(await screen.findByRole("dialog")).toHaveTextContent(
      "Анализ успешно обновлён!"
    );
  });

  it("handles update onError branch", async () => {
    render(
      <EditAnalysis
        assignmentId="a1"
        onClose={onClose}
        onFullClose={onFullClose}
      />
    );
    await screen.findByText("Glucose");
    act(() =>
      updateCallbacks.onError({ response: { data: { message: "Fail" } } })
    );
    expect(toast.error).toHaveBeenCalledWith("Ошибка обновления анализа: Fail");
  });

  it("handles delete onError branch", async () => {
    render(
      <EditAnalysis
        assignmentId="a1"
        onClose={onClose}
        onFullClose={onFullClose}
      />
    );
    await waitFor(() => screen.getByRole("button", { name: /Удалить анализ/ }));
    fireEvent.click(screen.getByRole("button", { name: /Удалить анализ/ }));
    act(() =>
      deleteCallbacks.onError({ response: { data: { message: "DelFail" } } })
    );
    expect(toast.error).toHaveBeenCalledWith("Ошибка удаления: DelFail");
  });
});
