import logger from '#config/logger.js';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(helmet());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => { logger.info(message.trim()) } } }));
app.use(cors());
app.use(cookieParser());

app.get('/', (req, res) => {
  logger.info('hello from allMightyAPI');
  res.send('hello world');
});

export default app;
