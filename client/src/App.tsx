import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header'; 
import Register from './components/Register';
import MainRoute from './components/MainRoute';
// import AnalysisSelector from './components/AnalysisSelector';
import Login from './components/Login';
import AssignAnalysis from './components/AssignAnalysis';
import SubmitAnalysis from './components/SubmitAnalysis';


const App: React.FC = () => {
    return (
        <Router>
            <div>
                <Header />
                <Routes>
                    <Route path="/" element={<MainRoute />} />
                    <Route path="/register" element={<Register />} />
                    {/* <Route path="/analysis" element={<AnalysisSelector />} /> */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/assign-analysis" element={<AssignAnalysis />} />
                    <Route path="/submit-analysis/:assignment_id" element={<SubmitAnalysis />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
