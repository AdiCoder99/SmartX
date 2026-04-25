import { Router } from 'express';
import { getContests, getContestById, createContest, updateContest, deleteContest } from '../controllers/contestController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';
const router = Router();

// Create a new contest
router.post('/create', authenticateUser, authorizeRoles('admin'), createContest);
// Get all active contests
router.get('/active', authenticateUser, authorizeRoles('admin', 'teacher'), getContests);
// Get a specific contest by ID
router.get('/:id', authenticateUser, authorizeRoles('admin', 'teacher'), getContestById);
// Update a contest
router.put('/:id', authenticateUser, authorizeRoles('admin'), updateContest);
// Delete a contest
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteContest);
