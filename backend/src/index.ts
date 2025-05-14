import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import meetingRoutes from './routes/meetings';
import teamMemberRoutes from './routes/teamMembers';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meeting-planner';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/meetings', meetingRoutes);
app.use('/api/team-members', teamMemberRoutes);

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  }); 