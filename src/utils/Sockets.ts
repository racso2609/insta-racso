import { Server } from 'socket.io';
import server from '../app';
import { NOTIFICATION, JOIN_USER_ID } from '../constants/SOCKETS';
// import User from '../models/userModel';
// import Post from '../models/postsModels';

class SocketWrapper {
    io = null;
    connectedSockets = {};
    constructor(server) {
        console.log(server);
        const io = new Server(server, {});
        io.on('connect', (socket) => {
            console.log('User connected');

            socket.on(JOIN_USER_ID, (userId) => {
                this.connectedSockets[userId] = socket;
                socket.join(userId);
            });

            socket.on('disconnect', () => {
                console.log(`socket ${socket.id} disconnected`);
            });
        });
        this.io = io;
    }
    pushNotification = ({ userId, type, message, entity }) => {
        console.log(message);
        const entityId = entity.id;
        this.io.to(userId).emit(NOTIFICATION, { message, type, entityId });
    };
}

const socketWrapper = new SocketWrapper(server);
export default socketWrapper;
