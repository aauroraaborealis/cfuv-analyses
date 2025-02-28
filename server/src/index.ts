import express, { Application } from 'express';
import cors from 'cors';
import http from 'http';
import userRouter from './routes/user.routes.js';
import teamRouter from './routes/team.routes.js';
import sportRouter from './routes/sport.routes.js';
import analysisRouter from './routes/analysis.routes.js';
import studentsRouter from './routes/students.routes.js';
import statsRouter from './routes/stats.routes.js';
import profileRouter from './routes/profile.routes.js';
import { initializeWebSocketServer } from './socketServer.js';
import db from './db.js';

(async () => {
  try {
    const result = await db.query('SELECT NOW()');
    console.log(
      'Подключение к базе данных успешно, текущее время:',
      result.rows[0].now
    );
  } catch (err: any) {
    console.error('Ошибка подключения к базе данных:', err.message);
    process.exit(1);
  }
})();

const PORT: number = parseInt(process.env.PORT || '8080', 10);
const app: Application = express();

app.use(cors());
app.use(express.json());
app.use('/api', userRouter);
app.use('/api/team', teamRouter);
app.use('/api/sport', sportRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/students', studentsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/user/profile', profileRouter);

const server = http.createServer(app);

initializeWebSocketServer(server);

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));

