
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateToken } from '../../utils/helpers/auth.js';
import AuthenticationError from '../../utils/errors/AuthenticationError.js';
import DatabaseError from '../../utils/errors/DatabaseError.js';
import NotFoundError from '../../utils/errors/NotFoundError.js';
import ConflictError from '../../utils/errors/ConflictError.js';
const prisma = new PrismaClient();

export const signup = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                role,
                password: hashedPassword,
            },
        });
        //const token = generateToken({ id: user.user_id });
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        if (error.code === 'P2002') {
            throw new ConflictError('Email already in use.');
        }
        console.log(error)
        throw new DatabaseError("Internal server error")
    }
};

export const signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new NotFoundError('email not found');
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            throw new AuthenticationError('Invalid credential')
        }
        const token = generateToken({ id: user.user_id.toString(), name: user.name, email: user.email, plan: user.plan });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'strict'
        }).status(200).json({ message: 'Signed in successfully' });
    } catch (error) {
        console.log(error)
        if (error instanceof AuthenticationError || error instanceof NotFoundError) {
            throw error
        }
        throw new DatabaseError("Internal server error")
    }
};
