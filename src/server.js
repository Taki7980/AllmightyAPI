import app from './app.js';
import logger from '#config/logger.js';

const port = process.env.PORT || 8000;

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
