const express = require('express');
const cors = require('cors');
const http = require('http'); // Импорт HTTP-модуля
const userRouter = require('./routes/user.routes');
const teamRouter = require('./routes/team.routes');
const sportRouter = require('./routes/sport.routes');
const analysisRouter = require('./routes/analysis.routes');
const studentsRouter = require('./routes/students.routes.js');
const { initializeWebSocketServer } = require('./socketServer'); // Импортируем WebSocket-сервер

const db = require('./db'); // Подключаем вашу конфигурацию для базы данных

(async () => {
  try {
    const result = await db.query('SELECT NOW()'); // Выполняем тестовый запрос
    console.log('Подключение к базе данных успешно, текущее время:', result.rows[0].now);
  } catch (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
    process.exit(1); // Завершаем процесс, если не удалось подключиться
  }
})();

const PORT = process.env.port || 8080;
const app = express();

// Настройка middleware
app.use(cors());
app.use(express.json());
app.use('/api', userRouter);
app.use('/api/team', teamRouter);
app.use('/api/sport', sportRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/students', studentsRouter);

// Создаем HTTP-сервер на основе Express
const server = http.createServer(app);

// Инициализация WebSocket-сервера
initializeWebSocketServer(server);

// Запуск сервера
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
