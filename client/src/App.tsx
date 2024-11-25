import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header'; 
import Register from './components/Register';
import MainRoute from './components/MainRoute';
import AnalysisSelector from './components/AnalysisSelector';
import CoachPanel from './components/CoachPanel';
import Login from './components/Login';

const App: React.FC = () => {
    return (
        <Router>
            <div>
                <Header />
                <Routes>
                    <Route path="/" element={<MainRoute />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/analysis" element={<AnalysisSelector />} />
                    <Route path="/coach-panel" element={<CoachPanel />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
