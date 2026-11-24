import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const saltRounds = Number(process.env.SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Determine college and department
    let collegeId = null;
    let departmentId = null;

    if (college) {
      let collegeData = await prisma.college.findFirst({
        where: { name: college },
      });

      if (!collegeData) {
        collegeData = await prisma.college.create({
          data: { name: college },
        });
      }
      collegeId = collegeData.id;

      if (department) {
        let deptData = await prisma.department.findFirst({
          where: { name: department, collegeId },
        });

        if (!deptData) {
          deptData = await prisma.department.create({
            data: { name: department, college },
          });
        }
        departmentId = deptData.id;
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        displayName,
        email,
        password: hashedPassword,
        phoneNumber: phoneNumber || null,
        collegeId,
        departmentId,
        academicYear: academicYear || null,
        isEmailVerified: false,
        isPhoneVerified: false,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Remove password from response
    const { password: _password, ...userResponse } = user;

    res.status(201).json({
      message: 'Account created successfully',
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error during signup' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        college: true,
        department: true,
      },
    });

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
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Remove password from response
    const { password: _password, ...userResponse } = user;

    res.json({
      message: 'Login successful',
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // by removing the token. We can blacklist it if needed.
  res.json({ message: 'Logout successful' });
});

export default router;