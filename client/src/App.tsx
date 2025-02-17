import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import AssignAnalysis from "./components/trainers/AssignAnalysis";
import SubmitAnalysis from "./components/students/SubmitAnalysis";
import DisplayAnalysis from "./components/trainers/DisplayAnalysis";
import AssignedAnalyses from "./components/trainers/AssignedAnalyses";
import UserAnalyses from "./components/students/UserAnalyses";
import ProtectedRoute from "./components/ProtectedRoute"; // 🔥 Новый компонент
import Page404 from "./components/Page404";
import UserDashboard from "./components/students/UserDashboard";
import ProfileForm from "./components/ProfileForm";
import SuccessModal from "./components/shared/SuccessModal";

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          {/* Открытые маршруты */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/not-found" element={<Page404 />} />

          {/* 🔒 Маршруты только для студентов */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/submit-analysis/:assignment_id" element={<SubmitAnalysis />} />
            <Route path="/my-analysis" element={<UserAnalyses />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/profile" element={<ProfileForm />} />

          </Route>

          {/* 🔒 Маршруты только для тренеров */}
          <Route element={<ProtectedRoute allowedRoles={["trainer"]} />}>
            <Route path="/assign-analysis" element={<AssignAnalysis />} />
            <Route path="/assignments" element={<AssignedAnalyses />} />
            <Route path="/analysis-results" element={<DisplayAnalysis />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
