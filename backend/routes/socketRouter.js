// backend/routes/socketRouter.js
const socketController = require('../controller/socketController');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Định nghĩa các "Route" (Sự kiện)
        
        socket.on('createRoom', (roomCode) => {
            socketController.handleCreateRoom(io, socket, roomCode);
        });

        socket.on('joinRoom', (roomCode) => {
            socketController.handleJoinRoom(io, socket, roomCode);
        });

        socket.on('makeMove', (data) => {
            socketController.handleMakeMove(io, socket, data);
        });

        socket.on('rollDice', (roomCode) => socketController.handleRollDice(io, socket, roomCode));

        socket.on('disconnect', () => {
            socketController.handleDisconnect(io, socket);
        });
    });
};