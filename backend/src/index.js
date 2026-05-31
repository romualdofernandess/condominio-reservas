require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const spaceRoutes = require('./routes/spaces');
const reservationRoutes = require('./routes/reservations');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
