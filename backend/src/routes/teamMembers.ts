import express, { Request, Response } from 'express';
import TeamMember from '../models/TeamMember';

const router = express.Router();

// Get all team members
router.get('/', async (req: Request, res: Response) => {
  try {
    const teamMembers = await TeamMember.find();
    res.json(teamMembers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team members', error });
  }
});

// Create a team member
router.post('/', async (req: Request, res: Response) => {
  try {
    const teamMember = new TeamMember(req.body);
    const savedTeamMember = await teamMember.save();
    res.status(201).json(savedTeamMember);
  } catch (error) {
    res.status(400).json({ message: 'Error creating team member', error });
  }
});

// Update team member availability
router.put('/:id/availability', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;
    
    const updatedMember = await TeamMember.findByIdAndUpdate(
      id,
      { availability },
      { new: true }
    );
    
    if (!updatedMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    
    res.json(updatedMember);
  } catch (error) {
    res.status(400).json({ message: 'Error updating availability', error });
  }
});

// Delete a team member
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deletedMember = await TeamMember.findByIdAndDelete(req.params.id);
    if (!deletedMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting team member', error });
  }
});

export default router; 