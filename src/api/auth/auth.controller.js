
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateToken } from '../../utils/helpers/auth.js';
import AuthenticationError from '../../utils/errors/AuthenticationError.js';
import DatabaseError from '../../utils/errors/DatabaseError.js';

const prisma = new PrismaClient();

export const signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await hashPassword(password);
        const user = await prisma.USERS.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        const token = generateToken({ id: user.user_id });
        res.status(201).json({ token });
    } catch (error) {
        return next(new DatabaseError(error.message));
    }
};

export const signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.USERS.findUnique({ where: { email } });
        if (!user) {
            return next(new AuthenticationError('Invalid credentials'));
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return next(new AuthenticationError('Invalid credentials'));
        }
        const token = generateToken({ id: user.user_id });
        res.status(200).json({ token });
    } catch (error) {
        return next(new DatabaseError(error.message));
    }
};
