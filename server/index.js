const express = require('express');
const cors = require('cors');
const userRouter = require('./routes/user.routes');
const teamRouter = require('./routes/team.routes');
const sportRouter = require('./routes/sport.routes');
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

app.use(cors());
app.use(express.json());
app.use('/api', userRouter);
app.use('/api/team', teamRouter);
app.use('/api/sport', sportRouter);

app.listen(PORT, () => console.log(`server started on ${PORT}`));
