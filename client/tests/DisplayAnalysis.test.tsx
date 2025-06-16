import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DisplayAnalysis, {
  formatDate,
} from "../src/components/trainers/DisplayAnalysis";

describe("formatDate utility", () => {
  it("formats ISO date string into DD.MM.YYYY HH:MM in Russian locale", () => {
    const iso = "2025-03-21T21:25:00Z";
    const formatted = formatDate(iso);

    expect(formatted).toMatch(/\d{2}\.03\.2025 \d{2}:25/);
  });
});

describe("DisplayAnalysis component", () => {
  const analysesResponse = [
    { analyze_id: "a1", analyze_name: "Test Analysis" },
  ];
  const tableDataResponse = [
    {
      assignment_id: "norms",
      Нормы: { Field: { unit: "u", lower_bound: 1, upper_bound: 2 } },
      "Дата сдачи": "2025-03-21T21:25:00Z",
      Field: { Значение: "42", is_normal: false },
    },
    {
      assignment_id: "r1",
      Нормы: null,
      "Дата сдачи": "2025-03-21T21:25:00Z",
      Field: { Значение: "1", is_normal: true },
    },
    {
      assignment_id: "r2",
      Нормы: null,
      "Дата сдачи": "2025-03-21T21:25:00Z",
      Field: { Значение: "2", is_normal: true },
    },
    {
      assignment_id: "r3",
      Нормы: null,
      "Дата сдачи": "2025-03-21T21:25:00Z",
      Field: { Значение: "3", is_normal: true },
    },
    {
      assignment_id: "r4",
      Нормы: null,
      "Дата сдачи": "2025-03-21T21:25:00Z",
      Field: { Значение: "4", is_normal: true },
    },
    {
      assignment_id: "r5",
      Нормы: null,
      "Дата сдачи": "2025-03-21T21:25:00Z",
      Field: { Значение: "5", is_normal: true },
    },
    {
      assignment_id: "r6",
      Нормы: null,
      "Дата сдачи": "2025-03-21T21:25:00Z",
      Field: { Значение: "6", is_normal: true },
    },
  ];

  beforeEach(() => {
    jest.restoreAllMocks();
    (global as any).fetch = jest
      .fn()
      .mockResolvedValueOnce({ json: async () => analysesResponse })
      .mockResolvedValueOnce({ ok: true, json: async () => tableDataResponse });
  });

  it("loads analyses and lets you pick one", async () => {
    render(<DisplayAnalysis />);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/analysis")
    );

    expect(screen.getByText("Выберите анализ")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByText("Выберите анализ"), {
      key: "ArrowDown",
    });
    expect(await screen.findByText("Test Analysis")).toBeInTheDocument();
  });

  it("shows loading, then table with norm header and formatted date", async () => {
    render(<DisplayAnalysis />);

    fireEvent.keyDown(screen.getByText("Выберите анализ"), {
      key: "ArrowDown",
    });
    fireEvent.click(await screen.findByText("Test Analysis"));

    expect(await screen.findByText("Загрузка данных...")).toBeInTheDocument();

    await waitFor(() => screen.getByRole("table"));

    expect(screen.getByText("u | Норма: 1 – 2")).toBeInTheDocument();

    expect(screen.getByText("1")).toBeInTheDocument();

    expect(
      screen.getAllByText(/\d{2}\.03\.2025 \d{2}:25/).length
    ).toBeGreaterThan(0);
  });

  it("displays a message when no data rows are returned", async () => {
    (global as any).fetch = jest
      .fn()
      .mockResolvedValueOnce({ json: async () => analysesResponse })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    render(<DisplayAnalysis />);

    fireEvent.keyDown(screen.getByText("Выберите анализ"), {
      key: "ArrowDown",
    });
    fireEvent.click(await screen.findByText("Test Analysis"));

    expect(
      await screen.findByText("Данные для этого анализа отсутствуют")
    ).toBeInTheDocument();
  });

  it("shows error message if fetch fails", async () => {
    (global as any).fetch = jest
      .fn()
      .mockResolvedValueOnce({ json: async () => analysesResponse })
      .mockResolvedValueOnce({ ok: false });

    render(<DisplayAnalysis />);

    fireEvent.keyDown(screen.getByText("Выберите анализ"), {
      key: "ArrowDown",
    });
    fireEvent.click(await screen.findByText("Test Analysis"));

    expect(
      await screen.findByText("Не удалось загрузить данные таблицы")
    ).toBeInTheDocument();
  });

  it("filters table rows based on search query", async () => {
    render(<DisplayAnalysis />);

    fireEvent.keyDown(screen.getByText("Выберите анализ"), {
      key: "ArrowDown",
    });
    fireEvent.click(await screen.findByText("Test Analysis"));

    await waitFor(() => screen.getByRole("table"));

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "nomatch" },
    });
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(
      screen.getByText("Данные для этого анализа отсутствуют")
    ).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "" } });
    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
  });
});
