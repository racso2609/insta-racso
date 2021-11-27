import express = require('express');
import { Request, Response, NextFunction } from 'express';
import cors = require('cors');
import passport = require('passport');
import morgan = require('morgan');
import helmet = require('helmet');
import dotenv = require('dotenv');
//import xss from "xss";
import ratelimit = require('express-rate-limit');
import mongoose = require('mongoose');
import { globalErrorController } from './controllers/globalError';
import { AppError } from './utils/AppError';

//socket
import { Server } from 'socket.io';
import { NOTIFICATION, JOIN_USER_ID } from './constants/SOCKETS';

// import {
// ClientToServerEvents,
// ServerToClientEvents,
// InterServerEvents,
// SocketData,
// } from './interfaces/interfaces.ts';
import path = require('path');
dotenv.config();
const app = express();
const limit = ratelimit({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: 'Too Many request, you are blocked for 1 hour',
});

app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use('*', limit);

app.use(helmet());
//app.use(xss());

app.use(cors());
app.options('*', cors());
app.use(passport.initialize());
app.use(morgan(process.env.LOGGER));
app.use(express.static(path.join(__dirname, '..', 'uploads')));
//Routes
import userRouter from './routes/user';
import followerRouter from './routes/follower';
import postRouter from './routes/post';
import likeRouter from './routes/likes';

app.use('/api/users', userRouter);
app.use('/api/followers', followerRouter);
app.use('/api/posts', postRouter);
app.use('/api/likes', likeRouter);

app.all('*', (_req: Request, _res: Response, next: NextFunction) => {
    return next(new AppError('This route is not yet defined!', 404));
});
app.use(globalErrorController);

const { NODE_ENV, MONGO_URI_TEST, MONGO_URI } = process.env;
const connectionString = NODE_ENV === 'test' ? MONGO_URI_TEST : MONGO_URI;

mongoose
    .connect(connectionString)
    .then(() => console.log('Database Connected'))
    .catch((err) => {
        console.log('Error', err);
        process.exit(1);
    });

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () =>
    console.log(`Server is listening on ${PORT}`)
);

[('unhandledRejection', 'uncaughtException')].forEach((processEvent) => {
    process.on(processEvent, (error) => {
        console.log(error);
        process.exit(1);
    });
});

class SocketWrapper {
    io = null;
    // connectedSockets = {};
    constructor(server) {
        const io = new Server(server, {});
        io.on('connect', (socket) => {
            console.log('User connected');

            socket.on(JOIN_USER_ID, (userId) => {
                // this.connectedSockets[userId] = socket;
                socket.join(userId);
                // console.log('connected', userId);
            });

            socket.on('disconnect', () => {
                console.log(`socket ${socket.id} disconnected`);
            });
        });
        this.io = io;
    }
    pushNotification = ({ userId, type, message, entityId }) => {
        this.io.in(userId).emit(NOTIFICATION, { message, type, entityId });
    };
}

const socketWrapper = new SocketWrapper(server);
export default socketWrapper;
