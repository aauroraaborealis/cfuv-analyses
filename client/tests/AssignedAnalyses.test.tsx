import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AssignedAnalyses from "../src/components/trainers/AssignedAnalyses";

jest.mock("@tanstack/react-query");
jest.mock("axios");
jest.mock(
  "../src/components/trainers/AnalysisModal",
  () =>
    ({ assignmentId, onClose }: any) => (
      <div role="dialog">
        Modal for {assignmentId}
        <button onClick={onClose}>Close</button>
      </div>
    )
);

describe("AssignedAnalyses", () => {
  let mockInvalidate: jest.Mock;
  const sampleData = [
    {
      assignment_id: "1",
      analyze_name: "Glucose",
      scheduled_date: "2025-01-01T00:00:00Z",
      sport_name: "Football",
      assigned_to_team: true,
      student_first_name: null,
      student_last_name: null,
      team_name: "Team A",
    },
    {
      assignment_id: "2",
      analyze_name: "Cholesterol",
      scheduled_date: "2025-02-02T00:00:00Z",
      sport_name: "Basketball",
      assigned_to_team: false,
      student_first_name: "Ivan",
      student_last_name: "Ivanov",
      team_name: null,
    },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
    mockInvalidate = jest.fn();
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidate,
    });
  });

  it("shows loading state", () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });
    render(<AssignedAnalyses />);
    expect(screen.getByText(/Загрузка данных/i)).toBeInTheDocument();
  });

  it("shows error state", () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: true,
    });
    render(<AssignedAnalyses />);
    expect(screen.getByText(/Ошибка загрузки данных/i)).toBeInTheDocument();
  });

  it("shows no-data message when filter yields none", () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: sampleData,
      isLoading: false,
      error: null,
    });
    render(<AssignedAnalyses />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "XXX" } });
    expect(
      screen.getByText(/Нет данных, соответствующих запросу/i)
    ).toBeInTheDocument();
  });

  it("renders table rows and opens modal on row click", async () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: sampleData,
      isLoading: false,
      error: null,
    });
    render(<AssignedAnalyses />);

    expect(screen.getByText("Glucose")).toBeInTheDocument();
    expect(screen.getByText("Cholesterol")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Glucose"));

    expect(await screen.findByRole("dialog")).toHaveTextContent("Modal for 1");

    fireEvent.click(screen.getByText("Close"));
    await waitFor(() =>
      expect(mockInvalidate).toHaveBeenCalledWith({
        queryKey: ["assignedAnalyses"],
      })
    );
  });
});
