// frontend/src/lib/gameLogic.ts

export const BOARD_SIZE = 5;

// Tạo bảng rỗng
export const createBoard = (): number[][] => {
  return Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0));
};

// Tính điểm
export const calculateScore = (board: number[][]): number => {
  let totalScore = 0;
  for (let c = 0; c < BOARD_SIZE; c++) {
    const colValues = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[r][c] !== 0) colValues.push(board[r][c]);
    }

    if (colValues.length === 0) continue;

    const counts: { [key: number]: number } = {};
    colValues.forEach((val) => (counts[val] = (counts[val] || 0) + 1));

    let colScore = 0;
    for (const [valStr, count] of Object.entries(counts)) {
      const val = parseInt(valStr);
      colScore += val * count * count;
    }
    totalScore += colScore;
  }
  return totalScore;
};

// Logic đặt xúc xắc (trả về bảng mới để React update state)
export const placeDie = (
  currentBoard: number[][],
  opponentBoard: number[][],
  colIndex: number,
  dieValue: number
) => {
  // Clone mảng để không mutate state trực tiếp
  const newBoard = currentBoard.map(row => [...row]);
  const newOpponentBoard = opponentBoard.map(row => [...row]);
  
  // 1. Đặt xúc xắc vào ô trống đầu tiên trong cột
  let placedRow = -1;
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (newBoard[r][colIndex] === 0) {
      newBoard[r][colIndex] = dieValue;
      placedRow = r;
      break;
    }
  }

  if (placedRow === -1) return { success: false, newBoard, newOpponentBoard, removedCount: 0 };

  // 2. Xử lý xóa quân đối thủ
  let removedCount = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (newOpponentBoard[r][colIndex] === dieValue) {
      newOpponentBoard[r][colIndex] = 0;
      removedCount++;
    }
  }

  // (Optional) Logic rơi quân cờ xuống nếu muốn (Gravity)
  // ...

  return { success: true, newBoard, newOpponentBoard, removedCount };
};

// Kiểm tra game over (Bảng đầy)
export const checkGameOver = (board: number[][]): boolean => {
    return board.every(row => row.every(cell => cell !== 0));
}