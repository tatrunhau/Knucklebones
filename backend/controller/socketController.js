// backend/controller/socketController.js
const { createBoard, rollDie, placeDie, calculateScore } = require('./gameLogic');

const rooms = new Map(); 

// 1. Tạo phòng
const handleCreateRoom = (io, socket, roomCode) => {
    if (rooms.has(roomCode)) {
        socket.emit('error', 'Mã phòng đã tồn tại!');
        return;
    }
    
    rooms.set(roomCode, {
        p1: socket.id,
        p2: null,
        board1: createBoard(),
        board2: createBoard(),
        turn: 'p1',
        currentDie: null, // SỬA: Để null, chờ người chơi bấm Roll
        gameOver: false
    });
    socket.join(roomCode);
    socket.emit('roomCreated', roomCode);
};

// 2. Vào phòng
const handleJoinRoom = (io, socket, roomCode) => {
    const room = rooms.get(roomCode);
    if (!room) { socket.emit('error', 'Phòng không tồn tại!'); return; }
    if (room.p2) { socket.emit('error', 'Phòng đã đầy!'); return; }

    room.p2 = socket.id;
    socket.join(roomCode);

    io.to(roomCode).emit('gameStart', {
        roomCode,
        currentDie: room.currentDie, // Lúc này là null
        turn: room.turn === 'p1' ? room.p1 : room.p2,
        players: { p1: room.p1, p2: room.p2 },
        board1: room.board1,
        board2: room.board2,
        score1: 0, 
        score2: 0
    });
};

// 3. Xử lý Roll Xúc Xắc (MỚI THÊM)
const handleRollDice = (io, socket, roomCode) => {
    const room = rooms.get(roomCode);
    if (!room || room.gameOver) return;

    // Chỉ người có lượt mới được roll
    const isTurn = (room.turn === 'p1' && socket.id === room.p1) || 
                   (room.turn === 'p2' && socket.id === room.p2);
    
    if (!isTurn) return;

    // Tạo giá trị xúc xắc
    const dieValue = rollDie();
    room.currentDie = dieValue;

    // Gửi về cho cả 2 người chơi
    io.to(roomCode).emit('diceRolled', { 
        value: dieValue, 
        player: socket.id 
    });
};

// 4. Xử lý Nước đi
const handleMakeMove = (io, socket, { roomCode, colIndex }) => {
    const room = rooms.get(roomCode);
    if (!room || room.gameOver) return;

    // (Giữ nguyên logic kiểm tra lượt và người chơi như cũ...)
    const isP1 = socket.id === room.p1;
    const isP2 = socket.id === room.p2;
    if (!isP1 && !isP2) return;
    const currentTurnId = room.turn === 'p1' ? room.p1 : room.p2;
    if (socket.id !== currentTurnId) return;

    // Nếu chưa roll thì không được đi
    if (!room.currentDie) return; 

    const myBoard = isP1 ? room.board1 : room.board2;
    const oppBoard = isP1 ? room.board2 : room.board1;

    const result = placeDie(myBoard, oppBoard, colIndex, room.currentDie);

    if (result.success) {
        const score1 = calculateScore(room.board1);
        const score2 = calculateScore(room.board2);
        
        // Reset xúc xắc sau khi đi xong
        room.currentDie = null; 

        const isFull = myBoard.every(row => row.every(cell => cell !== 0));
        
        if (isFull) {
            room.gameOver = true;
            io.to(roomCode).emit('gameStateUpdate', {
                board1: room.board1, board2: room.board2, score1, score2,
                turn: null, currentDie: null, gameOver: true,
                winner: score1 > score2 ? 'p1' : (score2 > score1 ? 'p2' : 'draw')
            });
        } else {
            // Đổi lượt
            room.turn = room.turn === 'p1' ? 'p2' : 'p1';
            const nextTurnId = room.turn === 'p1' ? room.p1 : room.p2;

            io.to(roomCode).emit('gameStateUpdate', {
                board1: room.board1, board2: room.board2, score1, score2,
                turn: nextTurnId,
                currentDie: null, // SỬA: Gửi null để người kia phải tự bấm Roll
                gameOver: false
            });
        }
    }
};

const handleDisconnect = (io, socket) => {
    rooms.forEach((room, roomCode) => {
        if (room.p1 === socket.id || room.p2 === socket.id) {
            io.to(roomCode).emit('playerLeft', 'Đối thủ đã thoát game.');
            rooms.delete(roomCode);
        }
    });
};

module.exports = {
    handleCreateRoom,
    handleJoinRoom,
    handleRollDice, // Xuất hàm mới
    handleMakeMove,
    handleDisconnect
};