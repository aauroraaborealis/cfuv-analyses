import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/Header";
import AppRoutes from "./components/AppRoutes";
import { useRefreshToken } from "./hooks/useRefreshToken";

const App: React.FC = () => {
  // useRefreshToken(); 
  return (
    <Router>
      <Header />
      <AppRoutes />
    </Router>
  );
};

export default App;
