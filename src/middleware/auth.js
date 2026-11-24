import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key', (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  });
};

// Authorize based on roles
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const userRole = req.user.role;
    // Check if user has one of the allowed roles
    // This is a simplified check - in a full app, we'd have a proper role hierarchy
    const hasAllowedRole = allowedRoles.some(role => role === userRole);

    if (!hasAllowedRole) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Get user role from DB
export const getUserRole = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      administrator: true,
      moderator: true,
    },
  });

  if (user.administrator) return 'college-admin';
  if (user.moderator) return 'general-mod';
  return 'student';
};