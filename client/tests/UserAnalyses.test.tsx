import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import UserAnalyses from "../src/components/athletes/UserAnalyses";
import { apiRequest, SERVER_LINK, WS_LINK } from "../src/utils/api";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";

jest.mock("../src/utils/api");
jest.mock("axios");

const mockApiRequest = apiRequest as jest.Mock;

let mockWsInstance: any;

beforeAll(() => {
  global.WebSocket = class {
    onopen = () => {};
    onmessage = (_: any) => {};
    onerror = () => {};
    onclose = () => {};
    constructor(url: string) {
      mockWsInstance = this;
      setTimeout(() => this.onopen(), 0);
    }
    send() {}
    close() {
      this.onclose();
    }
  };
});

describe("UserAnalyses", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    Storage.prototype.getItem = jest.fn().mockReturnValue("token");
  });

  it("показывает спиннер <Loading> пока грузит", () => {
    mockApiRequest.mockReturnValue(new Promise(() => {}));
    const { container } = render(<UserAnalyses />, { wrapper: BrowserRouter });

    expect(container.querySelector(".loader")).toBeInTheDocument();
  });

  it("если нет токена — не вызывает apiRequest и показывает спиннер", () => {
    Storage.prototype.getItem = jest.fn().mockReturnValue(null);
    const { container } = render(<UserAnalyses />, { wrapper: BrowserRouter });
    expect(mockApiRequest).not.toHaveBeenCalled();
    expect(container.querySelector(".loader")).toBeInTheDocument();
  });

  it("показывает сообщение, если нет анализов", async () => {
    mockApiRequest.mockResolvedValue({ analyses: [] });
    render(<UserAnalyses />, { wrapper: BrowserRouter });
    expect(
      await screen.findByText(/У вас нет назначенных анализов/i)
    ).toBeInTheDocument();
  });

  it("отображает список анализов и кнопки", async () => {
    mockApiRequest.mockResolvedValue({
      analyses: [
        {
          assignment_id: "a1",
          analyze_name: "Test 1",
          analyze_id: "t1",
          scheduled_date: "2025-06-01T00:00:00Z",
          assigned_to_team: false,
          is_submitted: false,
        },
        {
          assignment_id: "a2",
          analyze_name: "Test 2",
          analyze_id: "t2",
          scheduled_date: "2025-06-02T00:00:00Z",
          assigned_to_team: true,
          is_submitted: true,
        },
      ],
    });
    render(<UserAnalyses />, { wrapper: BrowserRouter });

    expect(await screen.findByText("Test 1")).toBeInTheDocument();
    expect(screen.getByText("Test 2")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Сдать/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Результаты/i })
    ).toBeInTheDocument();
  });

  it('загружает и показывает детали после клика "Результаты"', async () => {
    mockApiRequest.mockResolvedValue({
      analyses: [
        {
          assignment_id: "a2",
          analyze_name: "Test 2",
          analyze_id: "t2",
          scheduled_date: "2025-06-02T00:00:00Z",
          assigned_to_team: true,
          is_submitted: true,
        },
      ],
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              parameter_id: "p1",
              parameter_name: "Param1",
              value: "10",
              unit: "u",
              is_normal: true,
              created_at: "",
            },
            {
              parameter_id: "p2",
              parameter_name: "Param2",
              value: "20",
              unit: "u",
              is_normal: false,
              created_at: "",
            },
          ],
        }),
    });

    render(<UserAnalyses />, { wrapper: BrowserRouter });

    const btn = await screen.findByRole("button", { name: /Результаты/i });
    fireEvent.click(btn);

    expect(await screen.findByText(/Загрузка данных/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Param1: 10 u")).toBeInTheDocument();
      expect(screen.getByText("Param2: 20 u")).toBeInTheDocument();

      expect(screen.getByText("Param2: 20 u")).toHaveStyle("color: #911818");
    });
  });

  it("добавляет новый анализ по WebSocket", async () => {
    mockApiRequest.mockResolvedValue({
      analyses: [
        {
          assignment_id: "a1",
          analyze_name: "Test 1",
          analyze_id: "t1",
          scheduled_date: "2025-06-01T00:00:00Z",
          assigned_to_team: false,
          is_submitted: false,
        },
      ],
    });
    render(<UserAnalyses />, { wrapper: BrowserRouter });

    await screen.findByText("Test 1");

    act(() => {
      mockWsInstance.onmessage({
        data: JSON.stringify({
          type: "NEW_ANALYSIS",
          data: {
            assignment_id: "a3",
            analyze_name: "Test 3",
            analyze_id: "t3",
            scheduled_date: "2025-06-03T00:00:00Z",
            assigned_to_team: false,
            is_submitted: false,
          },
        }),
      });
    });

    expect(await screen.findByText("Test 3")).toBeInTheDocument();
  });
});
