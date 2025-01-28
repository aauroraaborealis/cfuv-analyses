CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    middlename VARCHAR(255),
    birth_date DATE,
    password VARCHAR(255) NOT NULL
);

-- Таблица для антропометрии и биоимпедансометрии
CREATE TABLE anthropometry_bioimpedance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id), -- Ссылка на пользователя
    height NUMERIC, -- Рост (см)
    weight NUMERIC, -- Вес (кг)
    waist_circumference NUMERIC, -- Обхват талии (см)
    hip_circumference NUMERIC, -- Обхват бедер (см)
    created_at TIMESTAMP DEFAULT NOW() -- Дата и время создания записи
);

CREATE TABLE sports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,       -- Название вида спорта
    is_team_sport BOOLEAN NOT NULL    -- Командный ли это спорт (TRUE или FALSE)
);

CREATE TABLE user_sports (
    id SERIAL PRIMARY KEY,                         -- Уникальный идентификатор записи
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,  -- Связь с users по user_id
    sport_id INTEGER REFERENCES sports(id) ON DELETE CASCADE,     -- Связь с таблицей sports
    team_name VARCHAR(255)                                  -- Название команды (NULL, если не командный спорт)
);
