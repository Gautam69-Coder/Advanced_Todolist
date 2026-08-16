import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import todoRoutes from './routes/todoRoutes.js';

// Load environmental parameters
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/neomorphic-todos';

// Middlewares
app.use(cors()); // Cross-Origin Resource sharing
app.use(express.json()); // parsing request JSON bodies

// MongoDB Database Connector
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB Database!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes mount
app.use('/api/todos', todoRoutes);

// Health check endpoints
const healthCheck = (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const status = {
    status: dbStatus === 'connected' ? 'UP' : 'DOWN',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
  };

  if (dbStatus !== 'connected') {
    return res.status(503).json(status);
  }
  res.status(200).json(status);
};

app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

// Server status base endpoint
app.get('/', (req, res) => {
  res.send('Neomorphic Todo List Express API is running.');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
