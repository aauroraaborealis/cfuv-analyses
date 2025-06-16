import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditStudentModal from "../src/components/trainers/EditAthleteModal";
import { useQuery } from "@tanstack/react-query";
import { fetchSports, fetchTeams } from "../src/utils/fetch";

jest.mock("@tanstack/react-query");
jest.mock("../src/utils/fetch");

describe("EditStudentModal", () => {
  const student = {
    student_id: "s1",
    last_name: "Ivanov",
    first_name: "Ivan",
    middle_name: "Petrovich",
    sport_id: "sp1",
    sport_name: "Football",
    team_id: "t1",
    team_name: "Team A",
  };

  const sportsOptions = [
    { value: "sp1", label: "Football" },
    { value: "sp2", label: "Basketball" },
  ];
  const teamsOptions = [
    { value: "t1", label: "Team A" },
    { value: "t2", label: "Team B" },
  ];

  beforeEach(() => {
    jest.resetAllMocks();

    (useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
      if (queryKey[0] === "sports") {
        return { data: sportsOptions, isLoading: false, refetch: jest.fn() };
      }
      if (queryKey[0] === "teams") {
        return { data: teamsOptions, isFetching: false, refetch: jest.fn() };
      }
      return {};
    });
    (fetchSports as jest.Mock).mockResolvedValue(sportsOptions);
    (fetchTeams as jest.Mock).mockResolvedValue(teamsOptions);
  });

  it("renders full name and initial sport, and calls onClose", () => {
    const onClose = jest.fn();
    const onSave = jest.fn();
    render(
      <EditStudentModal student={student} onClose={onClose} onSave={onSave} />
    );

    expect(screen.getByText("Ivanov Ivan Petrovich")).toBeInTheDocument();

    expect(screen.getByText("Football")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Закрыть/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("changes sport and invokes onSave with new sport and null team", async () => {
    const onClose = jest.fn();
    const onSave = jest.fn();
    render(
      <EditStudentModal student={student} onClose={onClose} onSave={onSave} />
    );

    const [sportInput] = screen.getAllByRole("combobox");
    fireEvent.keyDown(sportInput, { key: "ArrowDown" });
    await waitFor(() => screen.getByText("Basketball"));
    fireEvent.click(screen.getByText("Basketball"));
    fireEvent.click(screen.getByRole("button", { name: /Сохранить/i }));

    expect(onSave).toHaveBeenCalledWith(
      { value: "sp2", label: "Basketball" },
      null
    );
  });
});
