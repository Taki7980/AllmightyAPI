import logger from '#config/logger.js';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from '#routes/auth.routes.js';
import { securityMiddleware } from '#middleware/security.middleware.js';
import { UserRouter } from '#routes/user.routes.js';

const app = express();
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan('combined', {
    stream: {
      write: message => {
        logger.info(message.trim());
      },
    },
  })
);
app.use(securityMiddleware);
app.use(cors());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('hello world');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'AllmightyAPI running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRouter);
app.use('/api/users', UserRouter);

// catch 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
