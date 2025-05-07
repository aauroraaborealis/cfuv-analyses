import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useUserRole from "../hooks/useUserRole";
import Login from "./Login";
import Register from "./Register";
import Page404 from "./Page404";
import ProtectedRoute from "./ProtectedRoute";
import UserAnalyses from "./students/UserAnalyses";
import DisplayAnalysis from "./trainers/DisplayAnalysis";
import SubmitAnalysis from "./students/SubmitAnalysis";
import UserDashboard from "./students/UserDashboard";
import ProfileForm from "./ProfileForm";
import AssignAnalysis from "./trainers/AssignAnalysis";
import AssignedAnalyses from "./trainers/AssignedAnalyses";
import ProfileTrainer from "./ProfileTrainer";
import VerifyCode from "./VerifyCode";
import LoginVerify from "./LoginVerify";
import EditTeams from "./trainers/TeamsSportsManager";

const AppRoutes: React.FC = () => {
  const userRole = useUserRole();

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/not-found" element={<Page404 />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-code" element={<VerifyCode />} />
      <Route path="/login-verify" element={<LoginVerify />} />

      {/* Main redirect based on role */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["student", "trainer"]}>
            {userRole === "student" ? (
              <UserAnalyses />
            ) : userRole === "trainer" ? (
              <DisplayAnalysis />
            ) : (
              <Navigate to="/login" />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["student", "trainer"]}>
            {userRole === "student" ? (
              <ProfileForm />
            ) : userRole === "trainer" ? (
              <ProfileTrainer />
            ) : (
              <Navigate to="/login" />
            )}
          </ProtectedRoute>
        }
      />

      {/* Student-only */}
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route
          path="/submit-analysis/:assignment_id"
          element={<SubmitAnalysis />}
        />
        <Route path="/my-analysis" element={<UserAnalyses />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/profile" element={<ProfileForm />} />
      </Route>

      {/* Trainer-only */}
      <Route element={<ProtectedRoute allowedRoles={["trainer"]} />}>
        <Route path="/assign-analysis" element={<AssignAnalysis />} />
        <Route path="/assignments" element={<AssignedAnalyses />} />
        <Route path="/analysis-results" element={<DisplayAnalysis />} />
        <Route path="/profile" element={<ProfileTrainer />} />
        <Route path="/edit" element={<EditTeams />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Page404 />} />
    </Routes>
  );
};

export default AppRoutes;
