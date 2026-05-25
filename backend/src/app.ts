import express, { Express } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';

const app: Express = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth Routes
app.use('/api/auth', authRoutes);

// Default Route
app.get('/', (req, res) => {
  res.send('ClickPick API is running...');
});

export default app;
