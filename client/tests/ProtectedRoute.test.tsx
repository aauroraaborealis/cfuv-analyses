import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../src/components/ProtectedRoute";
import useUserRole from "../src/hooks/useUserRole";

jest.mock("../src/hooks/useUserRole");
const mockedUseUserRole = useUserRole as jest.Mock;

describe("ProtectedRoute component", () => {
  it("redirects to login if no userRole", () => {
    mockedUseUserRole.mockReturnValue(null);
    render(
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route
            path="/private"
            element={
              <ProtectedRoute allowedRoles={["student", "trainer"]}>
                <div>Private Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("redirects to not-found if role not allowed", () => {
    mockedUseUserRole.mockReturnValue("student");
    render(
      <MemoryRouter initialEntries={["/admin-area"]}>
        <Routes>
          <Route
            path="/admin-area"
            element={
              <ProtectedRoute allowedRoles={["trainer"]}>
                <div>Admin Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/not-found" element={<div>Not Found</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Not Found")).toBeInTheDocument();
  });

  it("renders children if role allowed", () => {
    mockedUseUserRole.mockReturnValue("trainer");
    render(
      <MemoryRouter initialEntries={["/trainer-dashboard"]}>
        <Routes>
          <Route
            path="/trainer-dashboard"
            element={
              <ProtectedRoute allowedRoles={["trainer"]}>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<div>Redirect</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders Outlet when no children provided", () => {
    mockedUseUserRole.mockReturnValue("student");
    render(
      <MemoryRouter initialEntries={["/nested"]}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="nested" element={<div>Nested Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Nested Page")).toBeInTheDocument();
  });
});
