import { AppError } from '../utils/AppError';
import { NextFunction, Request, Response } from 'express';
import jwt = require('jsonwebtoken');
import { userInterface } from '../interfaces/interfaces';
import User from '../models/userModel';
import { Email } from '../utils/Email';
import { getVerificationEmailTemplate } from '../helper/emailTemplates';
import crypto = require('crypto');
import { asyncHandler } from '../utils/asyncHandler';
import { Payload } from '../interfaces/interfaces';

//cont let = hola;
//clua << EOF
//require'lspconfig'.pyright.setup{}
//con let =hola;
const isValidEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);

const isRequiredValidationCompleted = (value: string) =>
    value && value.length > 0;

const isMinLengthValidationCompleted = (value: string, minLength: number) =>
    value && value.length >= minLength;

const isSignupValidationCompleted = (
    requestBody: userInterface,
    next: NextFunction
) => {
    const { firstName, lastName, password } = requestBody;
    if (
        !isRequiredValidationCompleted(firstName) ||
        !isRequiredValidationCompleted(lastName)
    )
        return next(new AppError('Firstname and Lastname are required!', 400));

    let { email } = requestBody;
    if (email) email = email.toLowerCase();

    if (!isValidEmail(email))
        return next(new AppError('Email is not valid!', 400));

    if (!isMinLengthValidationCompleted(password, 6))
        return next(
            new AppError('Password must be greater than 6 characters', 400)
        );

    return true;
};

const isLoginValidationCompleted = (
    requestBody: userInterface,
    next: NextFunction
) => {
    const { email, password } = requestBody;

    if (!isValidEmail(email))
        return next(new AppError('Email is not valid!', 400));

    if (!isMinLengthValidationCompleted(password, 6))
        return next(
            new AppError('Password must be greater than 6 characters', 400)
        );

    return true;
};
const signToken = (payload: Payload) =>
    jwt.sign({ user: payload }, process.env.SECRET_KEY, {
        expiresIn: 7200,
    });

const sendVerificationEmail = (user, verificationUrl: string) => {
    new Email(
        user.email,
        'Verify your email',
        'Please verify your email by clicking on the button above',
        getVerificationEmailTemplate(user, verificationUrl)
    ).send();
};

export const signup = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (isSignupValidationCompleted(req.body, next)) {
            const {
                firstName,
                lastName,
                email,
                password,
                phone,
            }: userInterface = req.body;
            const existingUser = await User.findOne({ email });
            if (existingUser)
                return next(new AppError('Email already taken', 400));

            const emailVerificationCode = crypto
                .randomBytes(32)
                .toString('hex');
            const user = await User.create({
                firstName,
                lastName,
                email,
                password,
                phone,
                photo: process.env.DEFAULT_USER_PHOTO,
                emailVerificationCode,
                emailVerified: false,
            });
            const verificationUrl = `${req.protocol}://${req.headers.host}/api/users/verify-email/${emailVerificationCode}`;
            sendVerificationEmail(user, verificationUrl);

            res.status(201).json({
                status: 'success',
                success: true,
                //user,
            });
            console.log('res');
        }
    }
);
export const login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (isLoginValidationCompleted) {
            const { email, password }: { email: string; password: string } =
                req.body;

            const user = await User.findOne({ email });
            if (!user)
                return next(
                    new AppError('User with this email does not exist!', 404)
                );

            if (!user.emailVerified)
                return next(
                    new AppError('Your email has not been verified yet!', 400)
                );
            const isCorrectPassword = await user.isValidPassword(password);
            if (!isCorrectPassword)
                return next(new AppError('Wrong password!', 404));

            const payload = {
                _id: user._id,
                email: user.email,
                role: user.role,
                phone: user.phone,
                Name: user.firstName + ' ' + user.lastName,
            };
            const token = signToken(payload);

            res.json({
                status: 'success',
                success: true,
                Token: token,
                role: user.role,
                Email: user.email,
                Phone: user.phone,
                Firstname: user.firstName,
                Lastname: user.lastName,
                id: payload._id
            });
        }
    }
);

export const verifyEmail = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const { emailVerificationCode } = req.params;

        await User.findOneAndUpdate(
            { emailVerificationCode },
            { emailVerified: true },
            { new: true }
        );

        // TODO: Update the redirection url in production
        const redirectionUrl =
            process.env.NODE_ENV === 'development'
                ? 'http://localhost:3000/login'
                : '';
        res.redirect(redirectionUrl);
    }
);

export const forgotPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email }: { email: string } = req.body;

        if (!email) return next(new AppError('Email is required!', 400));
        if (!isValidEmail(email))
            return next(new AppError('Email is not valid!', 400));

        let user = await User.findOne({ email });
        if (!user) return next(new AppError('User not exist!', 404));

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const message = `Forgot password? \n Copy your code: ${resetToken}`;
        try {
            await new Email(user.email, 'Password Reset', message).send();
            res.status(200).json({
                status: 'success',
                success: true,
                message: 'Token sent to email!',
            });
        } catch (error) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;

            await user.save({ validateBeforeSave: false });
            return next(
                new AppError(
                    'There was an error sending email. Try again later!',
                    500
                )
            );
        }
    }
);

export const resetPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { password } = req.body;

        if (!password || password.length < 6)
            return next(
                new AppError('Password must be greater than 6 characters!', 400)
            );

        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user)
            return next(new AppError('Token is invalid or has expired', 400));

        user.password = password;
        user.passwordResetExpires = undefined;
        user.passwordResetToken = undefined;

        await user.save();

        const payload = {
            _id: user._id,
            email: user.email,
            role: user.role,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.firstName,
            Name: user.firstName + ' ' + user.lastName,
        };
        const token = signToken(payload);

        res.status(200).json({
            status: 'success',
            token,
            data: payload,
        });
    }
);

export const updateProfile = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const { firstName, lastName, phone, email } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                firstName,
                lastName,
                email,
                phone,
            },
            { new: true }
        );

        res.status(200).json({
            status: 'success',
            data: updatedUser,
        });
    }
);

export const getLoggedInUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = req.user;
        const user = await User.findById(_id);
        if (!user) return next(new AppError('User do not exist!', 404));

        res.status(200).json({
            user: {
                role: user.role,
                email: user.email,
                phone: user.phone,
                name: user.firstName + ' ' + user.lastName,
                id: user._id
            },
            success: true,
            status: 'success',
        });
    }
);
