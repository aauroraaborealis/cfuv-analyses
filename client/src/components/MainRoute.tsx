import React from 'react';
import UserAnalyses from './athletes/UserAnalyses';

const MainRoute: React.FC = () => {

  return (
    <div>
      {/* <h1>Главная страница</h1> */}
      {/* <button onClick={() => navigate('/register')}>Регистрация</button>
      <button onClick={() => navigate('/analysis')}>Выбор анализа</button> */}
      <UserAnalyses/>
    </div>
  );
};

export default MainRoute;

