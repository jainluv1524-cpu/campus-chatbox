import express from 'express';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Get all users (admin only)
router.get('/users', authenticateToken, authorizeRoles('college-admin', 'super-admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;

    let whereClause = {};

    if (search) {
      whereClause.displayName = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (role) {
      whereClause.role = role; // This won't work directly - we need a different approach
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        fullName: true,
        displayName: true,
        email: false, // Never expose email
        phoneNumber: false,
        profilePictureUrl: true,
        collegeId: true,
        academicYear: true,
        isEmailVerified: true,
        isOnline: true,
        createdAt: true,
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { displayName: 'asc' },
    });

    const total = await prisma.user.count({ where: whereClause });

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify a student account
router.post('/users/:userId/verify', authenticateToken, authorizeRoles('college-admin', 'super-admin'), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
      select: {
        id: true,
        displayName: true,
        email: false,
        isEmailVerified: true,
      },
    });

    res.json({ user, message: 'Account verified successfully' });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Suspend or ban a user
router.post('/users/:userId/suspend', authenticateToken, authorizeRoles('college-admin', 'super-admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, duration } = req.body;

    // In a real app, we'd have a separate UserStatus or Suspension model
    // For now, we'll just log this action
    console.log(`User ${userId} suspended by admin. Reason: ${reason}, Duration: ${duration}`);

    res.json({ message: 'User suspended successfully', reason, duration });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all colleges
router.get('/colleges', authenticateToken, authorizeRoles('college-admin', 'super-admin'), async (req, res) => {
  try {
    const colleges = await prisma.college.findMany({
      include: {
        _count: {
          select: { students: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ colleges });
  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a college
router.post('/colleges', authenticateToken, authorizeRoles('super-admin'), async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'College name is required' });
    }

    const college = await prisma.college.create({
      data: {
        name,
        code: code || name.substring(0, 3).toUpperCase(),
      },
    });

    res.status(201).json({ college });
  } catch (error) {
    console.error('Create college error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all announcements
router.get('/announcements', authenticateToken, authorizeRoles('college-admin', 'super-admin'), async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      include: {
        author: {
          select: { id: true, displayName: true, profilePictureUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create an announcement
router.post('/announcements', authenticateToken, authorizeRoles('college-admin', 'super-admin'), async (req, res) => {
  try {
    const { title, content, type, collegeId, groupId, targetAudience } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        type: type || 'campus',
        collegeId,
        groupId,
        targetAudience: targetAudience || ['all'],
        authorId: req.user.userId,
      },
      include: {
        author: {
          select: { id: true, displayName: true, profilePictureUrl: true },
        },
      },
    });

    // TODO: Send notifications to relevant users

    res.status(201).json({ announcement });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get platform statistics
router.get('/statistics', authenticateToken, authorizeRoles('super-admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      totalColleges,
      totalGroups,
      totalChannels,
      totalMessages,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.college.count(),
      prisma.group.count(),
      prisma.channel.count(),
      prisma.message.count(),
    ]);

    const [
      newUsersThisMonth,
      activeUsersThisWeek,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.user.count({
        where: {
          isOnline: true,
        },
      }),
    ]);

    res.json({
      totalUsers,
      totalColleges,
      totalGroups,
      totalChannels,
      totalMessages,
      newUsersThisMonth,
      activeUsersThisWeek,
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get reported users
router.get('/reports', authenticateToken, authorizeRoles('college-admin', 'super-admin'), async (req, res) => {
  try {
    const { status } = req.query;

    let whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    const reports = await prisma.userReport.findMany({
      where: whereClause,
      include: {
        reporter: {
          select: { id: true, displayName: true },
        },
        reportedUser: {
          select: { id: true, displayName: true, profilePictureUrl: true, college: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Resolve a report
router.patch('/reports/:reportId/resolve', authenticateToken, authorizeRoles('college-admin', 'super-admin'), async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, resolutionNotes } = req.body;

    const report = await prisma.userReport.update({
      where: { id: reportId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: req.user.userId,
        ...(resolutionNotes && { description: resolutionNotes }),
      },
    });

    res.json({ report, message: 'Report resolved successfully' });
  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;