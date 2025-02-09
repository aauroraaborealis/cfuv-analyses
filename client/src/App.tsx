import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header'; 
import MainRoute from './components/MainRoute';
import Login from './components/Login';
import AssignAnalysis from './components/trainers/AssignAnalysis';
import SubmitAnalysis from './components/students/SubmitAnalysis';
import Admin from './components/trainers/Admin';
import DisplayAnalysis from './components/trainers/DisplayAnalysis';
import AssignedAnalyses from './components/trainers/AssignedAnalyses';
import Register from './components/Register';

const App: React.FC = () => {
    return (
        <Router>
            <div>
                <Header />
                <Routes>
                    <Route path="/" element={<MainRoute />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/analysis-results" element={<DisplayAnalysis />} />
                    <Route path="/assign-analysis" element={<AssignAnalysis />} />
                    <Route path="/assignments" element={<AssignedAnalyses />} />
                    <Route path="/submit-analysis/:assignment_id" element={<SubmitAnalysis />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
