import socketIo = require('socket.io');
import { server } from '../app';

const io = new socketIo.Server(server);
io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('like', () => {
        console.log('hola puta');
    });

    socket.on('disconnect', () => {
        console.log(`socket ${socket.id} disconnected`);
    });
});
