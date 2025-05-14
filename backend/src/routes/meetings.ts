import express, { Request, Response } from 'express';
import Meeting from '../models/Meeting';

const router = express.Router();

// Get all meetings
router.get('/', async (req: Request, res: Response) => {
  try {
    const meetings = await Meeting.find().sort({ date: 1 });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meetings', error });
  }
});

// Create a new meeting
router.post('/', async (req: Request, res: Response) => {
  try {
    const meeting = new Meeting(req.body);
    const savedMeeting = await meeting.save();
    res.status(201).json(savedMeeting);
  } catch (error) {
    res.status(400).json({ message: 'Error creating meeting', error });
  }
});

// Update a meeting
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updatedMeeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    res.json(updatedMeeting);
  } catch (error) {
    res.status(400).json({ message: 'Error updating meeting', error });
  }
});

// Delete a meeting
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deletedMeeting = await Meeting.findByIdAndDelete(req.params.id);
    if (!deletedMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting meeting', error });
  }
});

export default router; 