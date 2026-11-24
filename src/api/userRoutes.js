import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { prisma } from '../index.js';

const router = express.Router();

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        fullName: true,
        displayName: true,
        email: false, // Never expose email
        phoneNumber: false, // Never expose phone
        profilePictureUrl: true,
        collegeId: true,
        departmentId: true,
        academicYear: true,
        bio: true,
        interests: true,
        skills: true,
        isEmailVerified: true,
        isOnline: true,
        lastSeenAt: true,
        createdAt: true,
        college: {
          select: { id: true, name: true, code: true },
        },
        department: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const {
      bio,
      interests,
      skills,
      profilePictureUrl,
    } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        bio: bio || undefined,
        interests: interests || undefined,
        skills: skills || undefined,
        profilePictureUrl: profilePictureUrl || undefined,
      },
      select: {
        id: true,
        fullName: true,
        displayName: true,
        profilePictureUrl: true,
        bio: true,
        interests: true,
        skills: true,
      },
    });

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user directory (anonymous browsing)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { collegeId, departmentId } = req.query;

    let whereClause = {};

    if (collegeId) {
      whereClause.collegeId = collegeId;
    }

    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        fullName: true,
        displayName: true,
        profilePictureUrl: true,
        college: {
          select: { name: true, code: true },
        },
        department: {
          select: { name: true, code: true },
        },
        isOnline: true,
        academicYear: true,
      },
      take: 50,
    });

    res.json({ users });
  } catch (error) {
    console.error('Directory error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;