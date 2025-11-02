import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { createServer } from 'http';
import { initializeWebSocket } from './chatServer.js';

import connectDB from './config/db.js';
import authRoutes from './routers/authRoutes.js';
import hallRoutes from './routers/hallRoutes.js';
import chatRoutes from './routers/chatRoutes.js';
import clubRoutes from './routers/clubRoutes.js';
import loungeRoutes from './routers/loungeRoutes.js';
import inquiryRoutes from './routers/inquiryRoutes.js';
import hallBookingRoutes from './routers/hallBookingRoutes.js';
import hallPaymentRoutes from './routers/hallPaymentRoutes.js';
import userProfileRoutes from './routers/userProfileRoutes.js';
import userManagementRoutes from './routers/userManagementRoutes.js';
import { initializeCronJobs } from './jobs/hallBookingJobs.js';
import hallAnalyticsRoutes from './routers/hallAnalyticsRoutes.js';
import hallNotificationRoutes from './routers/hallNotificationRoutes.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
  })
);

await connectDB();

// Initialize cron jobs
initializeCronJobs();

app.use('/api/auth', authRoutes );
app.use('/api/hall', hallRoutes );
app.use('/api/club', clubRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/lounge', loungeRoutes);
app.use('/api/inquiry', inquiryRoutes);
app.use('/api/hallbooking', hallBookingRoutes);
app.use('/api/hallPayment', hallPaymentRoutes);
app.use('/api/analytics', hallAnalyticsRoutes);
app.use('/api/notifications', hallNotificationRoutes);
app.use('/api/profile', userProfileRoutes);
app.use('/api/admin/users', userManagementRoutes);

const PORT = process.env.PORT || 5000;

// HTTP server with WebSocket support
const server = createServer(app);

// Initialize WebSocket server
const io = initializeWebSocket(server);

// Start server with WebSocket support
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with WebSocket support`);
  console.log(`WebSocket server ready for real-time chat`);
});
