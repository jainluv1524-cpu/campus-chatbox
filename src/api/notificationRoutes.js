import express from 'express';
import Notification from '../models/Notification.js';
import { authenticateToken } from '../middleware/auth.js';
import { prisma } from '../index.js';

const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { unreadOnly } = req.query;

    let whereClause = {
      recipientId: userId,
    };

    if (unreadOnly === 'true') {
      whereClause.readAt = null;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
      where: { recipientId: userId }, // Security: only user can mark their own notifications as read
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark all notifications as read
router.patch('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    await prisma.notification.updateMany({
      where: {
        recipientId: userId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a notification (usually called by other routes)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { recipientId, type, relatedId, relatedModel, title, message } = req.body;

    const notification = await prisma.notification.create({
      data: {
        recipientId,
        type,
        relatedId,
        relatedModel,
        title,
        message,
        senderId: req.user.userId,
      },
    });

    res.status(201).json({ notification });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;