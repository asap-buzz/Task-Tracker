import mongoose from 'mongoose';
import app from './app.js';
import { config } from './config/index.js';

await mongoose.connect(config.mongoUri);
  app.listen(config.port, '0.0.0.0', () => console.log(`API listening on :${config.port}`));
