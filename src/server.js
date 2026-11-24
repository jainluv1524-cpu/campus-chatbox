const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// HTTP Server & Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Campus Chatbox API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ===== AUTH ROUTES =====

// Register route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const {
      fullName,
      displayName,
      email,
      password,
      confirmPassword,
      phoneNumber,
      college,
      department,
      academicYear,
    } = req.body;

    // Validation
    if (!fullName || !displayName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const dbPath = path.resolve(process.env.DATABASE_URL || './dev.db');

    let db;
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // Check if user exists
      const [existingUser] = await db.all('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Hash password
      const saltRounds = Number(process.env.SALT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate user ID
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create user
      await db.run(
        `INSERT INTO users 
        (id, fullName, displayName, email, password, phoneNumber, collegeId, departmentId, academicYear, isEmailVerified, isPhoneVerified) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, fullName, displayName, email, hashedPassword, phoneNumber || null, null, null, academicYear || null, 0, 0]
      );

      // Return user without password
      const [newUser] = await db.all('SELECT id, fullName, displayName, email, profilePictureUrl, collegeId, departmentId, academicYear, isOnline, lastSeenAt FROM users WHERE id = ?', [userId]);

      res.status(201).json({
        message: 'Account created successfully',
        user: {
          id: newUser.id,
          fullName: newUser.fullName,
          displayName: newUser.displayName,
          email: newUser.email,
          collegeId: newUser.collegeId,
          departmentId: newUser.departmentId,
          academicYear: newUser.academicYear,
        },
      });
    } finally {
      if (db) await db.close();
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error during signup' });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const dbPath = path.resolve(process.env.DATABASE_URL || './dev.db');

    let db;
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // Find user
      const [user] = await db.all('SELECT id, fullName, displayName, email, password, isEmailVerified, collegeId FROM users WHERE email = ?', [email]);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'campus-chatbox-super-secret-key-change-in-production-2026',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          displayName: user.displayName,
          email: user.email,
          collegeId: user.collegeId,
          isEmailVerified: user.isEmailVerified,
        },
      });
    } finally {
      if (db) await db.close();
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
});

// Get current user profile (requires auth)
app.get('/api/users/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campus-chatbox-super-secret-key-change-in-production-2026');

    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const dbPath = path.resolve(process.env.DATABASE_URL || './dev.db');

    let db;
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      const [user] = await db.all('SELECT id, fullName, displayName, profilePictureUrl, collegeId, departmentId, academicYear, bio, interests, skills, isOnline, lastSeenAt FROM users WHERE id = ?', [decoded.userId]);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user });
    } finally {
      if (db) await db.close();
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== PRIVATE MESSAGING ROUTES =====

// Start or get conversation
app.post('/api/chat', async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user.userId; // Set by auth middleware

    if (!participantId || participantId === userId) {
      return res.status(400).json({ message: 'Invalid participant ID' });
    }

    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const dbPath = path.resolve(process.env.DATABASE_URL || './dev.db');

    let db;
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // Check if conversation already exists
      const [existingConv] = await db.all(`
        SELECT c.id, COUNT(cp.userId) as participantCount
        FROM conversations c
        JOIN conversation_participants cp ON c.id = cp.conversationId
        WHERE cp.userId = ? AND cp.userId = ?
        GROUP BY c.id
        HAVING participantCount = 2
      `, [userId, participantId]);

      let conversation;

      if (existingConv.length > 0) {
        conversation = existingConv[0].id;
      } else {
        // Create new conversation
        const [result] = await db.run(
          `INSERT INTO conversations (id, lastMessageAt, unreadCount) VALUES (?, ?, ?)`,
          [`conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, new Date(), 0]
        );
        conversation = result.id;

        // Add participants
        await db.run(`INSERT INTO conversation_participants (conversationId, userId) VALUES (?, ?)`, [conversation, userId]);
        await db.run(`INSERT INTO conversation_participants (conversationId, userId) VALUES (?, ?)`, [conversation, participantId]);
      }

      // Get other participant's basic info (no private info)
      const [otherParticipant] = await db.all(
        `SELECT u.id, u.displayName, u.profilePictureUrl, u.isOnline FROM users u WHERE u.id = ?`,
        [participantId]
      );

      res.json({
        conversationId: conversation,
        otherParticipant: otherParticipant.length > 0 ? {
          id: otherParticipant[0].id,
          displayName: otherParticipant[0].displayName,
          profilePictureUrl: otherParticipant[0].profilePictureUrl,
          isOnline: otherParticipant[0].isOnline,
        } : null,
      });
    } finally {
      if (db) await db.close();
    }
  } catch (error) {
    console.error('Conversation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get conversations for user
app.get('/api/chat', async (req, res) => {
  try {
    const userId = req.user.userId;

    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const dbPath = path.resolve(process.env.DATABASE_URL || './dev.db');

    let db;
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      const conversations = await db.all(`
        SELECT c.id, c.lastMessageAt, c.unreadCount,
          (SELECT u.displayName FROM users u 
           JOIN conversation_participants cp ON u.id = cp.userId 
           WHERE cp.conversationId = c.id AND u.id != ? LIMIT 1) as otherParticipantName,
          (SELECT u.profilePictureUrl FROM users u 
           JOIN conversation_participants cp ON u.id = cp.userId 
           WHERE cp.conversationId = c.id AND u.id != LIMIT 1) as otherParticipantPhoto,
          (SELECT u.isOnline FROM users u 
           JOIN conversation_participants cp ON u.id = cp.userId 
           WHERE cp.conversationId = c.id AND u.id != LIMIT 1) as otherParticipantOnline,
          (SELECT COUNT(*) FROM messages m 
           WHERE m.conversationId = c.id AND m.senderId != ? AND m.status = 'delivered') as unreadCount
        FROM conversations c
        JOIN conversation_participants cp ON c.id = cp.conversationId
        WHERE cp.userId = ?
        ORDER BY c.lastMessageAt DESC
        LIMIT 50
      `, [userId, userId]);

      // Get last message for each conversation
      const formattedConversations = conversations.map(conv => {
        const otherId = conv.id; // simplified - would get actual other participant ID
        return {
          conversationId: conv.id,
          otherParticipantName: conv.otherParticipantName || 'Unknown',
          otherParticipantPhoto: conv.otherParticipantPhoto || '',
          otherParticipantOnline: conv.otherParticipantOnline || false,
          lastMessageAt: conv.lastMessageAt,
          unreadCount: conv.unreadCount,
        };
      });

      res.json({ conversations: formattedConversations });
    } finally {
      if (db) await db.close();
    }
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send message
app.post('/api/chat/:conversationId/message', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, imageUrl, fileUrl } = req.body;
    const senderId = req.user.userId;

    if (!content && !imageUrl && !fileUrl) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const dbPath = path.resolve(process.env.DATABASE_URL || './dev.db');

    let db;
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // Verify conversation participants
      const [participants] = await db.all(
        `SELECT userId FROM conversation_participants WHERE conversationId = ?`,
        [conversationId]
      );

      const participantIds = participants.map(p => p.userId);
      if (!participantIds.includes(senderId)) {
        return res.status(403).json({ message: 'Not a participant in this conversation' });
      }

      // Create message
      const [result] = await db.run(
        `INSERT INTO messages (id, conversationId, senderId, content, imageUrl, fileUrl, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, 'delivered', ?)`,
        [`msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, conversationId, senderId, content || null, imageUrl || null, fileUrl || null, new Date()]
      );

      // Update conversation last message time
      await db.run(
        `UPDATE conversations SET lastMessageAt = ? WHERE id = ?`,
        [new Date(), conversationId]
      );

      // Get sender info for response
      const [sender] = await db.all('SELECT id, displayName, profilePictureUrl FROM users WHERE id = ?', [senderId]);

      // Broadcast via Socket.IO to receiver(s)
      io.to(`user-${participantIds.find(p => p !== senderId)}`).emit('receive-message', {
        id: result.lastID,
        conversationId,
        senderId,
        content: content || '',
        sender: {
          id: sender[0].id,
          displayName: sender[0].displayName,
          profilePictureUrl: sender[0].profilePictureUrl,
        },
        createdAt: new Date().toISOString(),
        status: 'delivered',
      });

      res.status(201).json({
        message: 'Message sent successfully',
        message: {
          id: result.lastID,
          content: content || '',
          senderId,
          createdAt: new Date(),
          status: 'delivered',
          sender: {
            id: sender[0].id,
            displayName: sender[0].displayName,
            profilePictureUrl: sender[0].profilePictureUrl,
          },
        },
      });
    } finally {
      if (db) await db.close();
    }
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get conversation messages
app.get('/api/chat/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const dbPath = path.resolve(process.env.DATABASE_URL || './dev.db');

    let db;
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // Verify user is participant
      const [isParticipant] = await db.all(
        `SELECT 1 FROM conversation_participants WHERE conversationId = ? AND userId = ?`,
        [conversationId, userId]
      );

      if (!isParticipant[0]) {
        return res.status(403).json({ message: 'Not a participant in this conversation' });
      }

      const messages = await db.all(`
        SELECT m.id, m.senderId, m.content, m.imageUrl, m.fileUrl, m.status, m.createdAt,
          u.displayName, u.profilePictureUrl
        FROM messages m
        JOIN users u ON m.senderId = u.id
        WHERE m.conversationId = ?
        ORDER BY m.createdAt ASC
        LIMIT 100
      `, [conversationId]);

      // Mark messages as read
      await db.run(
        `UPDATE messages SET status = 'read', readAt = ? WHERE conversationId = ? AND senderId != ? AND status = 'delivered'`,
        [new Date(), conversationId, userId]
      );

      res.json({ messages });
    } finally {
      if (db) await db.close();
    }
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== CAMPUS COMMUNITIES (GROUPS) ROUTES =====

// Get user's groups
app.get('/api/groups', async (req, res) => {
  try {
    const userId = req.user.userId;

    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const dbPath = path.resolve(process.env.DATABASE_URL || './dev.db');

    let db;
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      const groups = await db.all(`
        SELECT g.id, g.name, g.description, g.isPrivate, g.isVerified, g.createdAt,
          COUNT(DISTINCT gm.userId) as memberCount,
          (SELECT u.displayName FROM users u WHERE u.id = g.creatorId) as creatorName
        FROM groups g
        JOIN group_members gm ON g.id = gm.groupId
        WHERE gm.role IN ('Member', 'Admin', 'Moderator')
          AND g.creatorId = ? OR g.id IN (
            SELECT groupId FROM group_members WHERE userId = ?
          )
        GROUP BY g.id
        ORDER BY g.createdAt DESC
        LIMIT 20
      `, [userId, userId]);

      res.json({ groups });
    } finally {
      if (db) await db.close();
    }
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create group
app.post('/api/groups', async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    const creatorId = req.user.userId;

    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const dbPath = path.resolve(process.env.DATABASE_URL || './dev.db');

    let db;
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      const [result] = await db.run(
        `INSERT INTO groups (id, name, description, isPrivate, isVerified, creatorId) VALUES (?, ?, ?, ?, ?, ?)`,
        [`group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name, description || '', isPrivate !== undefined ? isPrivate : true, false, creatorId]
      );

      // Add creator as admin member
      await db.run(
        `INSERT INTO group_members (id, userId, groupId, role) VALUES (?, ?, ?, ?)`,
        [`member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, creatorId, result.lastID, 'Admin']
      );

      res.status(201).json({ group: { id: result.lastID, name, description, isPrivate, isVerified: false, creatorId } });
    } finally {
      if (db) await db.close();
    }
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== GROUP CHANNELS ROUTES =====

// Get group channels
app.get('/api/groups/:groupId/channels', async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;

    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const dbPath = path.resolve(process.env.DATABASE_URL || './dev.db');

    let db;
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // Check if user is member of group
      const [member] = await db.all(
        `SELECT role FROM group_members WHERE groupId = ? AND userId = ?`,
        [groupId, userId]
      );

      if (!member[0]) {
        return res.status(403).json({ message: 'You are not a member of this group' });
      }

      const channels = await db.all(
        `SELECT c.id, c.name, c.description, c.isAnnouncement, c.isCampusDefault, c.createdAt,
          COUNT(DISTINCT cm.userId) as memberCount
        FROM channels c
        LEFT JOIN channel_members cm ON c.id = cm.channelId
        WHERE c.groupId = ?
        GROUP BY c.id
        ORDER BY c.isAnnouncement DESC, c.name`
        , [groupId]
      );

      res.json({ channels });
    } finally {
      if (db) await db.close();
    }
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create channel
app.post('/api/groups/:groupId/channels', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, isAnnouncement } = req.body;
    const creatorId = req.user.userId;

    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const dbPath = path.resolve(process.env.DATABASE_URL || './dev.db');

    let db;
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // Check if user is member
      const [member] = await db.all(
        `SELECT role FROM group_members WHERE groupId = ? AND userId = ?`,
        [groupId, creatorId]
      );

      if (!member[0]) {
        return res.status(403).json({ message: 'You are not a member of this group' });
      }

      const [result] = await db.run(
        `INSERT INTO channels (id, name, description, isAnnouncement, isCampusDefault, groupId, creatorId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [`channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name, description || '', isAnnouncement || false, false, groupId, creatorId]
      );

      res.status(201).json({ channel: { id: result.lastID, name, description: description || '', isAnnouncement: isAnnouncement || false, isCampusDefault: false, groupId, creatorId } });
    } finally {
      if (db) await db.close();
    }
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== NOTIFICATIONS ROUTES =====

// Get user notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { unreadOnly } = req.query;

    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const dbPath = path.resolve(process.env.DATABASE_URL || './dev.db');

    let db;
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      let whereClause = `recipientId = '${userId}'`;
      if (unreadOnly === 'true') {
        whereClause += ` AND readAt IS NULL`;
      }

      const notifications = await db.all(
        `SELECT * FROM notifications WHERE ${whereClause} ORDER BY createdAt DESC LIMIT 50`
      );

      res.json({ notifications });
    } finally {
      if (db) await db.close();
    }
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark notification as read
app.patch('/api/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const dbPath = path.resolve(process.env.DATABASE_URL || './dev.db');

    let db;
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      const [result] = await db.run(
        `UPDATE notifications SET readAt = ? WHERE id = ? AND recipientId = ?`,
        [new Date(), notificationId, userId]
      );

      if (result.changes === 0) {
        return res.status(404).json({ message: 'Notification not found or not yours' });
      }

      res.json({ message: 'Notification marked as read' });
    } finally {
      if (db) await db.close();
    }
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== PRIVACY SETTINGS ROUTE =====

// Update user settings/privacy
app.patch('/api/users/settings', async (req, res) => {
  try {
    const { profileVisibility, displayNameVisibility, onlineStatusVisibility, lastSeenVisibility, profilePictureVisibility, messageReadReceipts } = req.body;
    const userId = req.user.userId;

    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const dbPath = path.resolve(process.env.DATABASE_URL || './dev.db');

    let db;
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // Build update query dynamically
      const updates = [];
      const values = [];

      if (profileVisibility) {
        updates.push(`profileVisibility = ?`);
        values.push(profileVisibility);
      }
      if (displayNameVisibility) {
        updates.push(`displayNameVisibility = ?`);
        values.push(displayNameVisibility);
      }
      if (onlineStatusVisibility) {
        updates.push(`onlineStatusVisibility = ?`);
        values.push(onlineStatusVisibility);
      }
      if (lastSeenVisibility) {
        updates.push(`lastSeenVisibility = ?`);
        values.push(lastSeenVisibility);
      }
      if (profilePictureVisibility) {
        updates.push(`profilePictureVisibility = ?`);
        values.push(profilePictureVisibility);
      }
      if (messageReadReceipts !== undefined) {
        updates.push(`messageReadReceipts = ?`);
        values.push(messageReadReceipts ? 1 : 0);
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: 'No settings provided' });
      }

      updates.push(`updatedAt = ?`);
      values.push(new Date());
      values.push(userId);

      const query = `UPDATE user_settings SET ${updates.join(', ')} WHERE userId = ?`;
      await db.run(query, values);

      // Get updated user settings
      const [settings] = await db.all('SELECT * FROM user_settings WHERE userId = ?', [userId]);

      res.json({ settings });
    } finally {
      if (db) await db.close();
    }
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== BLOCK/REPORT ROUTES =====

// Block user
app.post('/api/users/block', async (req, res) => {
  try {
    const { blockedUserId } = req.body;
    const userId = req.user.userId;

    if (!blockedUserId || blockedUserId === userId) {
      return res.status(400).json({ message: 'Invalid user to block' });
    }

    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const dbPath = path.resolve(process.env.DATABASE_URL || './dev.db');

    let db;
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // Check if already blocked
      const [existingBlock] = await db.all(
        `SELECT * FROM user_blocks WHERE blockerId = ? AND blockedId = ?`,
        [userId, blockedUserId]
      );

      if (existingBlock.length > 0) {
        return res.status(400).json({ message: 'User already blocked' });
      }

      await db.run(
        `INSERT INTO user_blocks (id, blockerId, blockedId, createdAt) VALUES (?, ?, ?, ?)`,
        [`block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, userId, blockedUserId, new Date()]
      );

      // Also create notification
      await db.run(
        `INSERT INTO notifications (id, recipientId, type, relatedId, relatedModel, title, message, senderId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [`notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, blockedUserId, 'system', blockedUserId, 'user', 'Account Action', 'Your account has been blocked by another user', userId]
      );

      res.json({ message: 'User blocked successfully' });
    } finally {
      if (db) await db.close();
    }
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Report user
app.post('/api/users/report', async (req, res) => {
  try {
    const { reportedUserId, reason, description } = req.body;
    const reporterId = req.user.userId;

    if (!reportedUserId || reportedUserId === reporterId) {
      return res.status(400).json({ message: 'Invalid user to report' });
    }

    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const dbPath = path.resolve(process.env.DATABASE_URL || './dev.db');

    let db;
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      const [result] = await db.run(
        `INSERT INTO user_reports (id, reporterId, reportedUserId, reason, status, createdAt) VALUES (?, ?, ?, ?, 'pending', ?)`,
        [`report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, reporterId, reportedUserId, reason || 'other', new Date()]
      );

      // Create notification for reported user
      await db.run(
        `INSERT INTO notifications (id, recipientId, type, relatedId, relatedModel, title, message, senderId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [`notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, reportedUserId, 'report', result.lastID, 'report', 'Your account has been reported', description || 'No description provided', reporterId]
      );

      res.json({ message: 'Report submitted successfully' });
    } finally {
      if (db) await db.close();
    }
  } catch (error) {
    console.error('Report user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== ADMIN ROUTES =====

// Get all users (admin only)
app.get('/api/admin/users', async (req, res) => {
  try {
    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const dbPath = path.resolve(process.env.DATABASE_URL || './dev.db');

    let db;
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      const users = await db.all(`
        SELECT u.id, u.displayName, u.email, u.isEmailVerified, u.isOnline, u.lastSeenAt,
          c.name as collegeName
        FROM users u
        LEFT JOIN colleges c ON u.collegeId = c.id
        ORDER BY u.displayName ASC
      `);

      res.json({ users });
    } finally {
      if (db) await db.close();
    }
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify user account
app.patch('/api/admin/users/:userId/verify', async (req, res) => {
  try {
    const { userId } = req.params;

    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const dbPath = path.resolve(process.env.DATABASE_URL || './dev.db');

    let db;
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      const [result] = await db.run(
        `UPDATE users SET isEmailVerified = 1 WHERE id = ?`,
        [userId]
      );

      if (result.changes === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'Account verified successfully' });
    } finally {
      if (db) await db.close();
    }
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get platform statistics (super admin only)
app.get('/api/admin/statistics', async (req, res) => {
  try {
    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const dbPath = path.resolve(process.env.DATABASE_URL || './dev.db');

    let db;
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      const [
        totalUsers,
        totalColleges,
        totalGroups,
        totalChannels,
        totalMessages,
        newUsersToday,
      ] = await Promise.all([
        db.get(`SELECT COUNT(*) as count FROM users`),
        db.get(`SELECT COUNT(*) as count FROM colleges`),
        db.get(`SELECT COUNT(*) as count FROM groups`),
        db.get(`SELECT COUNT(*) as count FROM channels`),
        db.get(`SELECT COUNT(*) as count FROM messages`),
        db.get(`SELECT COUNT(*) as count FROM users WHERE createdAt >= date('now', '-1 day')`),
      ]);

      res.json({
        totalUsers,
        totalColleges,
        totalGroups,
        totalChannels,
        totalMessages,
        newUsersToday,
      });
    } finally {
      if (db) await db.close();
    }
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
  console.log(`🚀 Campus Chatbox Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Socket.IO: ws://localhost:${PORT}`);
});

module.exports = app;