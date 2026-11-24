import prisma from '../index.js';

export const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Get user's role from the database
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          administrator: {
            select: { role: true, collegeId: true },
          },
          moderator: {
            select: { role: true, collegeId: true },
          },
        },
      });

      let userRole = 'student';

      if (user.administrator) {
        userRole = user.administrator.role || 'college-admin';
        // Check if the admin is for the right college (if applicable)
        if (req.collegeId && user.administrator.collegeId !== req.collegeId) {
          return res.status(403).json({ message: 'Admin access restricted to your college' });
        }
      } else if (user.moderator) {
        userRole = user.moderator.role || 'general-mod';
      }

      const hasAllowedRole = allowedRoles.some(role => role === userRole);

      if (!hasAllowedRole) {
        return res.status(403).json({ message: `Role '${userRole}' does not have permission to perform this action` });
      }

      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// College-aware middleware - sets collegeId from user's college
export const withCollegeContext = async (req, res, next) => {
  try {
    if (req.user && req.user.userId) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { collegeId: true },
      });

      req.collegeId = user?.collegeId;
    }
    next();
  } catch (error) {
    console.error('College context error:', error);
    next();
  }
};