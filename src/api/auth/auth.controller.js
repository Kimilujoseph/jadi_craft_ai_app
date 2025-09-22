
import prisma from "../../database/client.js"
import { hashPassword, comparePassword, generateToken } from '../../utils/helpers/auth.js';
import ErrorHandler from '../../utils/ErrorHandler.js';



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
        next(new ErrorHandler(error.message, 500));
    }
};

export const signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.USERS.findUnique({ where: { email } });
        if (!user) {
            return next(new ErrorHandler('Invalid credentials', 401));
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return next(new ErrorHandler('Invalid credentials', 401));
        }
        const token = generateToken({ id: user.user_id });
        res.status(200).json({ token });
    } catch (error) {
        next(new ErrorHandler(error.message, 500));
    }
};
