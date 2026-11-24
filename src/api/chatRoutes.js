import express from 'express';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { prisma } from '../index.js';

const router = express.Router();

// Start a new conversation (or get existing one)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { participantId } = req.body;
    const currentUserId = req.user.userId;

    if (!participantId || participantId === currentUserId) {
      return res.status(400).json({ message: 'Invalid participant ID' });
    }

    // Check if conversation already exists between these two users
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: { id: currentUserId },
          some: { id: participantId },
        },
      },
      include: {
        participants: true,
      },
    });

    let conversation;

    if (existingConversation) {
      conversation = existingConversation;
    } else {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [
              { id: currentUserId },
              { id: participantId },
            ],
          },
        },
        include: {
          participants: true,
        },
      });
    }

    // Get the other participant's info (excluding private info)
    const otherParticipant = conversation.participants.find(
      (p) => p.id !== currentUserId
    );

    res.json({
      conversationId: conversation.id,
      otherParticipant: {
        id: otherParticipant.id,
        displayName: otherParticipant.displayName,
        profilePictureUrl: otherParticipant.profilePictureUrl,
      },
      lastMessageAt: conversation.lastMessageAt,
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all conversations for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { id: userId },
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            displayName: true,
            profilePictureUrl: true,
            isOnline: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
      take: 100,
    });

    // Format conversations with unread counts
    const formattedConversations = conversations.map((conv) => {
      const participant = conv.participants.find((p) => p.id !== userId);
      const unreadCount = conv.messages
        .filter((msg) => msg.senderId !== userId && msg.status !== 'read')
        .length;

      return {
        conversationId: conv.id,
        otherParticipant: participant
          ? {
              id: participant.id,
              displayName: participant.displayName,
              profilePictureUrl: participant.profilePictureUrl,
              isOnline: participant.isOnline,
            }
          : null,
        lastMessageAt: conv.lastMessageAt,
        unreadCount,
        totalMessages: conv._count.messages,
      };
    });

    res.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get conversation messages
router.get('/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    // Check if user is participant in this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: { id: userId },
        },
      },
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            sender: {
              select: {
                id: true,
                displayName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Mark messages as delivered/read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        status: 'delivered',
      },
      data: { status: 'read', readAt: new Date() },
    });

    // Format messages (newest first)
    const formattedMessages = conversation.messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      sender: {
        id: msg.sender.id,
        displayName: msg.sender.displayName,
        profilePictureUrl: msg.sender.profilePictureUrl,
      },
      createdAt: msg.createdAt,
      status: msg.status,
      imageUrl: msg.imageUrl,
      fileUrl: msg.fileUrl,
    }));

    res.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send a message
router.post('/:conversationId/message', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, imageUrl, fileUrl } = req.body;
    const senderId = req.user.userId;

    if (!content && !imageUrl && !fileUrl) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Check if conversation exists and user is participant
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: { id: senderId },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content || null,
        imageUrl: imageUrl || null,
        fileUrl: fileUrl || null,
        status: 'delivered',
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    res.status(201).json({
      message: 'Message sent successfully',
      messageData: {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        createdAt: message.createdAt,
        status: message.status,
        sender: {
          id: message.sender.id,
          displayName: message.sender.displayName,
          profilePictureUrl: message.sender.profilePictureUrl,
        },
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get unread count
router.get('/:conversationId/unread-count', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: { id: userId },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const unreadCount = await prisma.message.count({
      where: {
        conversationId,
        senderId: { not: userId },
        status: 'delivered', // Only count delivered messages as unread
      },
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;