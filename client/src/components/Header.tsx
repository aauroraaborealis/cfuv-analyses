import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/header.css'
const Header: React.FC = () => {
    const navigate = useNavigate();

    const goToMain = () => {
        navigate('/'); 
    };

    return (
        <header className='headerStyle'>
            <button onClick={goToMain} className='buttonStyle'>
                На главную
            </button>
        </header>
    );
};


export default Header;
