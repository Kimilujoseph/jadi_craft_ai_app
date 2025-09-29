import jwt from 'jsonwebtoken';
import prisma from '../database/client.js';
import AuthenticationError from '../utils/errors/AuthenticationError.js';


const JWT_SECRET = process.env.JWT_SECRET

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw new AuthenticationError('Authentication token is required.');
    }
    const decoded = jwt.verify(token, JWT_SECRET);


    const user = await prisma.uSERS.findUnique({
      where: { user_id: decoded.id },
    });

    if (!user) {
      throw new AuthenticationError('User not found.');
    }
    req.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid authentication token.'));
    } else {
      next(error);
    }
  }
};

export default authMiddleware;