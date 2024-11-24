interface Sport {
    id: number;
    name: string;
    isTeamSport?: boolean;
  }
  
  const sportsList: Sport[] = [
    { id: 1, name: 'Футбол'},
    { id: 2, name: 'Баскетбол'},
    { id: 3, name: 'Волейбол'},
    { id: 4, name: 'Теннис'},
    { id: 5, name: 'Бег'},
    { id: 6, name: 'Плавание'},
  ];
  
  export default sportsList;
  