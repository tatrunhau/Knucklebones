// backend/controller/gameLogic.js

const BOARD_SIZE = 5;

// --- Helper Functions ---
const createBoard = () => Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0));

const rollDie = () => Math.floor(Math.random() * 6) + 1;

const calculateScore = (board) => {
    let totalScore = 0;
    for (let c = 0; c < BOARD_SIZE; c++) {
        const colValues = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
            if (board[r][c] !== 0) colValues.push(board[r][c]);
        }

        if (colValues.length === 0) continue;

        // Đếm số lần xuất hiện
        const counts = {};
        colValues.forEach(val => counts[val] = (counts[val] || 0) + 1);

        let colScore = 0;
        for (const [val, count] of Object.entries(counts)) {
            const value = parseInt(val);
            // Công thức: Value * Count * Multiplier (Multiplier = Count)
            colScore += (value * count * count);
        }
        totalScore += colScore;
    }
    return totalScore;
};

// --- Core Game Actions ---

const placeDie = (board, opponentBoard, colIndex, value) => {
    // colIndex từ 0-4 (Frontend gửi lên)
    if (colIndex < 0 || colIndex >= BOARD_SIZE) return { success: false };

    // Tìm vị trí trống đầu tiên trong cột
    let placedRow = -1;
    for (let r = 0; r < BOARD_SIZE; r++) {
        if (board[r][colIndex] === 0) {
            board[r][colIndex] = value;
            placedRow = r;
            break;
        }
    }

    if (placedRow === -1) return { success: false }; // Cột đầy

    // Xử lý tấn công: Xóa xúc xắc đối thủ
    let removedCount = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        if (opponentBoard[r][colIndex] === value) {
            opponentBoard[r][colIndex] = 0;
            removedCount++;
        }
    }

    // Dồn xúc xắc đối thủ xuống (Gravity)
    // Nếu xóa ở giữa, các ô trên phải rơi xuống
    if (removedCount > 0) {
        const newCol = opponentBoard.map(row => row[colIndex]).filter(val => val !== 0);
        while (newCol.length < BOARD_SIZE) newCol.push(0); // Fill 0 ở cuối (hoặc đầu tùy logic vẽ, ở đây giả sử 0 là trống)
        
        // Cập nhật lại cột đối thủ (Lưu ý: Logic Python của bạn vẽ từ trên xuống, code này giữ nguyên structure)
        // Nếu logic vẽ của bạn là [0,0,0,x,x] hay [x,x,0,0,0] cần đồng bộ. 
        // Code Python place_die: find first empty spot. 
        // Ở đây ta giữ nguyên vị trí mảng 2 chiều.
        
        // Sửa lại logic xóa: Gán về 0 là đủ, Frontend sẽ render lại.
        // Tuy nhiên để chuẩn game Knucklebones, xúc xắc lơ lửng phải rơi xuống.
        // Tạm thời ta chỉ gán 0 để giống logic Python gốc.
    }

    return { success: true, removedCount, placedRow };
};

// --- AI Logic ---
const getAttackScore = (opponentBoard, col, value) => {
    let count = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        if (opponentBoard[r][col] === value) count++;
    }
    return count;
};

const getAiMove = (aiBoard, playerBoard, dieValue) => {
    let bestCol = -1;
    let maxPriority = -1;
    const availableCols = [];

    // Tìm cột còn chỗ (Check hàng cuối cùng)
    for (let c = 0; c < BOARD_SIZE; c++) {
        if (aiBoard[BOARD_SIZE - 1][c] === 0) availableCols.push(c);
    }

    if (availableCols.length === 0) return { col: -1 }; // Hết chỗ

    // Heuristic từ Python
    for (let col of availableCols) {
        // 1. Điểm tấn công
        const attackScore = getAttackScore(playerBoard, col, dieValue);

        // 2. Điểm tích lũy bản thân
        const colValues = aiBoard.map(row => row[col]).filter(v => v !== 0);
        colValues.push(dieValue);
        // Đếm số lượng dieValue trong cột giả định
        const count = colValues.filter(v => v === dieValue).length;
        
        let selfScore = 0;
        if (count >= 2) selfScore = count * 5;

        // 3. Tổng điểm ưu tiên
        const priority = (attackScore * 3) + selfScore;

        if (priority > maxPriority) {
            maxPriority = priority;
            bestCol = col;
        }
    }

    // Nếu không có nước đi tối ưu (maxPriority vẫn -1), chọn ngẫu nhiên
    if (bestCol === -1) {
        bestCol = availableCols[Math.floor(Math.random() * availableCols.length)];
    }

    return { col: bestCol };
};

module.exports = {
    createBoard,
    rollDie,
    calculateScore,
    placeDie,
    getAiMove
};