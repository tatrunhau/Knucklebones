// src/app/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Bot, Users, ArrowLeft, Copy, Check } from "lucide-react";
import { HowToPlayModal } from "@/components/how-to-play-modal";
import { useGameSocket } from "@/hooks/useGameSocket";
import { createBoard, calculateScore, placeDie, checkGameOver, BOARD_SIZE } from "@/lib/gameLogic";

// --- Type Definitions ---
type GameMode = "menu" | "vsai" | "multiplayer-lobby" | "multiplayer-game";
const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

// Helper để tạo bảng rỗng
const createEmptyBoard = () => Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0));

// --- LOGIC AI (Giữ nguyên) ---
const getSimpleAiMove = (aiBoard: number[][], playerBoard: number[][], dieValue: number): number => {
  let bestCol = -1;
  let maxPriority = -1;
  const availableCols = [];

  for (let c = 0; c < BOARD_SIZE; c++) {
    const isColFull = aiBoard.every(row => row[c] !== 0);
    if (!isColFull) availableCols.push(c);
  }

  if (availableCols.length === 0) return -1;

  for (let col of availableCols) {
    let attackScore = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (playerBoard[r][col] === dieValue) attackScore++;
    }

    let selfScore = 0;
    let countInCol = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (aiBoard[r][col] === dieValue) countInCol++;
    }
    if (countInCol >= 1) selfScore = (countInCol + 1) * dieValue;

    const priority = (attackScore * 10) + selfScore + Math.random();

    if (priority > maxPriority) {
      maxPriority = priority;
      bestCol = col;
    }
  }

  return bestCol;
};


// ================== MAIN PAGE COMPONENT ==================

export default function KnucklebonesGame() {
  const [gameMode, setGameMode] = useState<GameMode>("menu");
  const [roomCode, setRoomCode] = useState("");
  const [generatedRoomCode, setGeneratedRoomCode] = useState("");
  const [copied, setCopied] = useState(false);

  const {
    isConnected,
    createRoom,
    joinRoom,
    errorMsg,
    myRole,
    gameState: socketGameState,
    makeMove: socketMakeMove,
    socket,
  } = useGameSocket(gameMode.includes("multiplayer"));

  // --- Handlers cho Menu & Lobby ---
  const generateRoomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedRoomCode(code);
    createRoom(code);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(generatedRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinRoom = () => {
    if (roomCode.length === 6) {
      joinRoom(roomCode);
    }
  };

  useEffect(() => {
    if (gameMode === "multiplayer-lobby" && socketGameState) {
      setGameMode("multiplayer-game");
    }
  }, [socketGameState, gameMode]);

  // --- Render Views ---

  if (gameMode === "menu") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center gap-3 mb-6">
              {[Dice6, Dice5, Dice4].map((DiceIcon, i) => (
                <DiceIcon
                  key={i}
                  className="w-12 h-12 text-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <h1 className="text-6xl font-bold text-balance bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Knucklebones
            </h1>
            <p className="text-xl text-muted-foreground">Chiến thuật xúc xắc 5×5</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card
              className="cursor-pointer hover:border-primary transition-all hover:scale-105 bg-card/50 backdrop-blur"
              onClick={() => setGameMode("vsai")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Bot className="w-8 h-8 text-primary" />
                  </div>
                  <span>Chơi với máy</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Thử thách với AI thông minh</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-secondary transition-all hover:scale-105 bg-card/50 backdrop-blur"
              onClick={() => setGameMode("multiplayer-lobby")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-secondary/10">
                    <Users className="w-8 h-8 text-secondary" />
                  </div>
                  <span>Chơi 1v1</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Thách đấu với bạn bè qua mã phòng</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center pt-4">
            <HowToPlayModal />
          </div>
        </div>
      </div>
    );
  }

if (gameMode === "multiplayer-lobby") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
        <div className="max-w-2xl w-full space-y-6">
          <Button variant="ghost" onClick={() => setGameMode("menu")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          {!isConnected && <p className="text-red-500 text-center">Đang kết nối tới máy chủ...</p>}
          {errorMsg && <p className="text-red-500 text-center">{errorMsg}</p>}

          <div className="text-center space-y-2 mb-8">
            <h2 className="text-4xl font-bold text-primary">Chế độ 1v1</h2>
            <p className="text-muted-foreground">Tạo phòng hoặc tham gia với mã phòng</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card Tạo phòng */}
            <Card className="bg-card/50 backdrop-blur">
              <CardHeader>
                {/* SỬA: Thêm text-center để căn giữa tiêu đề */}
                <CardTitle className="text-2xl text-center">Tạo phòng mới</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!generatedRoomCode ? (
                  <Button className="w-full h-12 text-lg" onClick={generateRoomCode} disabled={!isConnected}>
                    Tạo mã phòng
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted text-center">
                      <p className="text-sm text-muted-foreground mb-2">Mã phòng của bạn</p>
                      <p className="text-3xl font-bold font-mono tracking-wider text-primary">{generatedRoomCode}</p>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent" onClick={copyRoomCode}>
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Đã sao chép
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Sao chép mã
                        </>
                      )}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground animate-pulse">Đang chờ đối thủ...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card Tham gia phòng */}
            {/* Logic cũ: Làm mờ nếu đang tạo phòng */}
            <Card className={`bg-card/50 backdrop-blur transition-opacity ${generatedRoomCode ? "opacity-50" : "opacity-100"}`}>
              <CardHeader>
                {/* SỬA: Thêm text-center để căn giữa tiêu đề */}
                <CardTitle className="text-2xl text-center">Tham gia phòng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {/* SỬA: Căn giữa label nhập mã cho đẹp đội hình */}
                  <label className="text-sm text-muted-foreground block text-center">Nhập mã phòng</label>
                  <Input
                    placeholder={generatedRoomCode ? "Bạn đang là chủ phòng" : "VD: ABC123"}
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="h-12 text-lg font-mono text-center tracking-wider"
                    maxLength={6}
                    disabled={!!generatedRoomCode} // Vô hiệu hóa nếu đã tạo phòng
                  />
                </div>
                <Button
                  className="w-full h-12 text-lg"
                  disabled={roomCode.length !== 6 || !isConnected || !!generatedRoomCode}
                  onClick={handleJoinRoom}
                >
                  {generatedRoomCode ? "Đang đợi đối thủ..." : "Vào phòng"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GameBoard
      isMultiplayer={gameMode === "multiplayer-game"}
      onBack={() => setGameMode("menu")}
      socketGameState={socketGameState}
      myRole={myRole}
      socketMakeMove={socketMakeMove}
      roomCode={generatedRoomCode || roomCode}
      socket={socket}
    />
  );
}

// ================== GAME BOARD COMPONENT ==================

interface GameBoardProps {
  isMultiplayer: boolean;
  onBack: () => void;
  socketGameState?: any;
  myRole?: "p1" | "p2" | null;
  socketMakeMove?: (col: number, code: string) => void;
  roomCode?: string;
  socket?: any;
}

function GameBoard({ isMultiplayer, onBack, socketGameState, myRole, socketMakeMove, roomCode, socket }: GameBoardProps) {
  // State
  const [myBoard, setMyBoard] = useState(createEmptyBoard());
  const [oppBoard, setOppBoard] = useState(createEmptyBoard());
  const [currentDie, setCurrentDie] = useState<number | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [turn, setTurn] = useState<string>("my"); // "my" | "opp" | socketId
  const [isRolling, setIsRolling] = useState(false);
  const [removingDice, setRemovingDice] = useState<Map<string, number>>(new Map()); const [gameOverMsg, setGameOverMsg] = useState("");
  const [hasRolled, setHasRolled] = useState(false);

  // --- [ONLINE] Sync Logic ---
  useEffect(() => {
    if (!isMultiplayer || !socketGameState || !myRole || !socket) return;

    const { board1, board2, score1, score2, turn: serverTurn, currentDie: serverDie } = socketGameState;

    if (myRole === "p1") {
      setMyBoard(board1);
      setOppBoard(board2);
      setMyScore(score1);
      setOppScore(score2);
    } else {
      setMyBoard(board2);
      setOppBoard(board1);
      setMyScore(score2);
      setOppScore(score1);
    }

    setTurn(serverTurn);

    // Sync trạng thái Roll từ Server
    if (serverDie !== null && serverDie !== undefined) {
      setCurrentDie(serverDie);
      setHasRolled(true);
    } else {
      setCurrentDie(null);
      setHasRolled(false);
    }

    if (socketGameState.gameOver) {
      let msg = "";
      if (myScore > oppScore) msg = "BẠN THẮNG!";
      else if (myScore < oppScore) msg = "BẠN THUA!";
      else msg = "HÒA!";
      setGameOverMsg(msg);
    }
  }, [isMultiplayer, socketGameState, myRole, socket]);


  // --- [ONLINE] Listen for Roll Event ---
  useEffect(() => {
    if (!isMultiplayer || !socket) return;

    const handleDiceRolled = ({ value, player }: { value: number, player: string }) => {
      // 1. Bắt đầu hiệu ứng ngay lập tức
      setIsRolling(true);

      // 2. Đợi 600ms (cho animation xoay xong) rồi mới cập nhật số
      setTimeout(() => {
        setCurrentDie(value);
        setIsRolling(false);
        setHasRolled(true);
      }, 600);
    };

    socket.on('diceRolled', handleDiceRolled);

    return () => {
      socket.off('diceRolled', handleDiceRolled);
    };
  }, [socket, isMultiplayer]);


  // --- [OFFLINE] Logic VS AI ---
  useEffect(() => {
    if (isMultiplayer || gameOverMsg) return;

    if (turn === "opp") {
      setHasRolled(true);
      const aiDie = Math.floor(Math.random() * 6) + 1;
      setCurrentDie(aiDie);

      setIsRolling(true);
      setTimeout(() => setIsRolling(false), 600);

      setTimeout(() => {
        const col = getSimpleAiMove(oppBoard, myBoard, aiDie);
        if (col !== -1) {
          const result = placeDie(oppBoard, myBoard, col, aiDie);
          if (result.success) {
            if (result.removedCount > 0) {
              triggerRemoveEffect(myBoard, aiDie, col, true);
            }

            setOppBoard(result.newBoard);
            setMyBoard(result.newOpponentBoard);
            setOppScore(calculateScore(result.newBoard));
            setMyScore(calculateScore(result.newOpponentBoard));

            if (checkGameOver(result.newBoard) || checkGameOver(result.newOpponentBoard)) {
              const finalMy = calculateScore(result.newOpponentBoard);
              const finalOpp = calculateScore(result.newBoard);
              setGameOverMsg(finalMy > finalOpp ? "BẠN THẮNG!" : "AI THẮNG!");
            } else {
              setTurn("my");
              setHasRolled(false);
              setCurrentDie(null);
            }
          }
        }
      }, 1500);
    }
  }, [turn, isMultiplayer, gameOverMsg]);


  // --- Helper Effects ---
  // TÌM HÀM triggerRemoveEffect CŨ VÀ THAY BẰNG:

  const triggerRemoveEffect = (targetBoard: number[][], dieValue: number, colIndex: number, isMyBoard: boolean) => {
    // Map lưu: Key="boardId-row-col", Value=giá trị xúc xắc (chính là dieValue)
    const updates = new Map<string, number>();

    for (let r = 0; r < BOARD_SIZE; r++) {
      if (targetBoard[r][colIndex] === dieValue) {
        updates.set(`${isMyBoard ? 'my' : 'opp'}-${r}-${colIndex}`, dieValue);
      }
    }

    if (updates.size > 0) {
      // Thêm vào danh sách đang xóa
      setRemovingDice(prev => new Map([...prev, ...updates]));

      // Sau 600ms (bằng thời gian animation) thì xóa khỏi Map
      setTimeout(() => {
        setRemovingDice(prev => {
          const next = new Map(prev);
          updates.forEach((_, k) => next.delete(k));
          return next;
        });
      }, 600);
    }
  };

  const isMyTurn = isMultiplayer ? turn === socket?.id : turn === "my";

  const handleRollClick = () => {
    if (hasRolled || isRolling) return;

    // --- LOGIC ONLINE ---
    if (isMultiplayer && socket && roomCode) {
      if (!isMyTurn) return;

      setIsRolling(true); // <--- Bật hiệu ứng ngay lúc bấm
      socket.emit('rollDice', roomCode);
      return;
    }

    // --- LOGIC OFFLINE (Giữ nguyên) ---
    if (!isMyTurn) return;
    setIsRolling(true);
    const newDie = Math.floor(Math.random() * 6) + 1;
    setCurrentDie(newDie);
    setHasRolled(true);
    setTimeout(() => setIsRolling(false), 600);
  };

  const handleColumnClick = (colIndex: number) => {
    if (gameOverMsg) return;

    // Kiểm tra điều kiện click
    if (!isMyTurn || !hasRolled || currentDie === null) return;

    const dieToPlace = currentDie;

    // ONLINE Move
    if (isMultiplayer && socketMakeMove && roomCode) {
      triggerRemoveEffect(oppBoard, dieToPlace, colIndex, false);
      socketMakeMove(colIndex, roomCode);
      return;
    }

    // OFFLINE Move
    const result = placeDie(myBoard, oppBoard, colIndex, dieToPlace);

    if (result.success) {
      if (result.removedCount > 0) {
        triggerRemoveEffect(oppBoard, dieToPlace, colIndex, false);
      }

      setMyBoard(result.newBoard);
      setOppBoard(result.newOpponentBoard);
      setMyScore(calculateScore(result.newBoard));
      setOppScore(calculateScore(result.newOpponentBoard));

      if (checkGameOver(result.newBoard) || checkGameOver(result.newOpponentBoard)) {
        const finalMyScore = calculateScore(result.newBoard);
        const finalOppScore = calculateScore(result.newOpponentBoard);
        setGameOverMsg(finalMyScore > finalOppScore ? "BẠN THẮNG!" : "AI THẮNG!");
      } else {
        setTurn("opp");
      }
    }
  };

  const CurrentDiceIcon = currentDie ? diceIcons[currentDie - 1] : null;
  const turnStatusText = gameOverMsg || (isMyTurn ? "Lượt của bạn" : "Lượt đối thủ");
  const opponentName = isMultiplayer ? "Player 2" : "AI";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
      <div className="max-w-7xl w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Menu
          </Button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary">{isMultiplayer ? "Chế độ 1v1" : "VS AI"}</h2>
            <p className={`text-sm font-bold ${isMyTurn ? "text-accent" : "text-destructive"}`}>{turnStatusText}</p>
          </div>
          <div className="w-24" />
        </div>

        {/* Game Area */}
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">

          {/* Đối thủ (Trái) */}
          <div className="flex flex-col items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-4">
              <Card className="bg-card/50 backdrop-blur shrink-0">
                <CardContent className="pt-6 pb-4 px-6">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Đối thủ</p>
                    <p className="text-lg font-bold">{opponentName}</p>
                    <div className="p-3 rounded-lg bg-destructive/10">
                      <p className="text-3xl font-bold text-destructive">{oppScore}</p>
                      <p className="text-xs text-muted-foreground mt-1">điểm</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <DiceBoard board={oppBoard} isOpponent removingDice={removingDice} boardId="opp" />
            </div>
          </div>

          {/* Center Info */}
          <div className="flex flex-col items-center gap-4 w-[220px]"> {/* Cố định cột giữa */}

            {/* Khung hiển thị xúc xắc */}
            <Card className="w-[220px] h-[240px] bg-gradient-to-b from-primary/20 via-secondary/20 to-accent/20 backdrop-blur border-2 border-primary/50 flex flex-col items-center justify-center shadow-lg">
              <CardContent className="p-0 flex flex-col items-center justify-center gap-4 w-full h-full">
                <p className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Xúc xắc</p>

                <div className="w-[100px] h-[100px] rounded-2xl bg-background/80 flex items-center justify-center shadow-inner border border-primary/20">
                  {/* LOGIC SỬA ĐỔI: */}
                  {/* Nếu có currentDie -> Hiện icon đó */}
                  {/* Nếu KHÔNG có currentDie nhưng đang isRolling -> Hiện tạm Dice6 để xoay */}
                  {(currentDie || isRolling) ? (
                    (() => {
                      // Nếu đang roll mà chưa có số thì lấy tạm Dice6 làm hình nộm để xoay
                      const IconToRender = currentDie ? diceIcons[currentDie - 1] : diceIcons[5];
                      return (
                        <IconToRender
                          className={`w-20 h-20 text-primary ${isRolling ? "animate-dice-roll" : ""}`}
                        />
                      );
                    })()
                  ) : (
                    // Chỉ hiện chữ Wait khi không roll và không có số
                    <span className="text-muted-foreground text-sm font-medium">Wait...</span>
                  )}
                </div>

                <div className="h-10 flex items-center justify-center">
                  {/* Khi đang roll thì hiện dấu "..." hoặc "?" */}
                  <p className="text-4xl font-black text-foreground drop-shadow-sm">
                    {isRolling ? "..." : (currentDie || "?")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Khung chứa nút: Dùng Flex để căn giữa nút bên trong */}
            <div className="w-full h-14 flex items-center justify-center">
              {!gameOverMsg && (
                <Button
                  variant={hasRolled ? "outline" : "default"}
                  size="lg"
                  onClick={handleRollClick}
                  disabled={!isMyTurn || hasRolled || isRolling}
                  // SỬA: w-[180px] để cố định kích thước nút (không đổi theo chữ), và nhỏ hơn khung cha để đẹp hơn
                  className={`w-[180px] h-12 text-lg font-bold shadow-md transition-all ${hasRolled ? "bg-transparent opacity-60 border-2" : "animate-pulse hover:scale-105"
                    }`}
                >
                  {isRolling ? "..." : hasRolled ? "Đã Roll" : "Roll Ngay"}
                </Button>
              )}
            </div>

            {/* Trạng thái lượt */}
            <div className="h-10 w-full flex items-center justify-center">
              <div
                className={`px-6 py-2 rounded-full font-bold text-sm shadow-sm transition-colors border-2 ${isMyTurn
                  ? "bg-accent/10 text-accent border-accent/50"
                  : "bg-destructive/10 text-destructive border-destructive/50"
                  }`}
              >
                {turnStatusText}
              </div>
            </div>
          </div>

          {/* Người chơi (Phải) */}
          <div className="flex flex-col items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-4">
              <DiceBoard
                board={myBoard}
                removingDice={removingDice}
                onColumnClick={handleColumnClick}
                boardId="my"
                canClick={isMyTurn && hasRolled && !gameOverMsg && currentDie !== null}
              />
              <Card className="bg-card/50 backdrop-blur shrink-0">
                <CardContent className="pt-6 pb-4 px-6">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Người chơi</p>
                    <p className="text-lg font-bold">Bạn</p>
                    <div className="p-3 rounded-lg bg-accent/10">
                      <p className="text-3xl font-bold text-accent">{myScore}</p>
                      <p className="text-xs text-muted-foreground mt-1">điểm</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Card className="bg-card/30 backdrop-blur">
          <CardContent className="pt-4">
            <p className="text-center text-sm text-muted-foreground">
              Nhấn nút 'Roll Xúc Xắc' khi đến lượt, sau đó chọn cột để đặt.
              Xúc xắc trùng giá trị sẽ xóa xúc xắc đối thủ!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ================== COMPONENT HIỂN THỊ BẢNG ==================

// TÌM COMPONENT DiceBoard VÀ THAY THẾ TOÀN BỘ BẰNG:

interface DiceBoardProps {
  board: number[][];
  isOpponent?: boolean;
  // SỬA TYPE Ở ĐÂY TỪ Set -> Map
  removingDice?: Map<string, number>;
  onColumnClick?: (colIndex: number) => void;
  boardId: "my" | "opp";
  canClick?: boolean;
}

function DiceBoard({
  board,
  isOpponent = false,
  removingDice = new Map(), // Default value mới
  onColumnClick,
  boardId,
  canClick = false
}: DiceBoardProps) {

  if (!board || !Array.isArray(board)) {
    return <div className="p-4 text-center text-xs">Đang tải bảng...</div>;
  }

  const getDiceIcon = (cellValue: number, rowIndex: number, colIndex: number) => {
    const key = `${boardId}-${rowIndex}-${colIndex}`;

    // LOGIC QUAN TRỌNG:
    // Nếu ô có giá trị -> Lấy giá trị đó.
    // Nếu ô = 0 nhưng trong removingDice có key -> Lấy giá trị trong Map (Ghost Dice)
    const ghostValue = removingDice.get(key);
    const finalValue = cellValue !== 0 ? cellValue : (ghostValue || 0);

    // Nếu cả thực tế và bóng ma đều là 0 thì không vẽ gì
    if (finalValue === 0) return null;

    const DiceIcon = diceIcons[finalValue - 1];

    // Nếu đang nằm trong danh sách xóa thì thêm class animation
    const isRemoving = removingDice.has(key);

    return (
      <div className={isRemoving ? "animate-dice-remove z-50 relative pointer-events-none" : ""}>
        <DiceIcon className={`w-8 h-8 ${isOpponent ? "text-destructive" : "text-accent"}`} />
      </div>
    );
  };

  return (
    <div className="inline-flex flex-col gap-1 p-4 rounded-xl bg-card/50 backdrop-blur border-2 border-border relative">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1">
          {row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                w-14 h-14 rounded-lg border-2 transition-all flex items-center justify-center overflow-hidden
                ${cell === 0 ? "bg-muted/30 border-border" : "bg-card border-border"}
              `}
            >
              {getDiceIcon(cell, rowIndex, colIndex)}
            </div>
          ))}
        </div>
      ))}

      {!isOpponent && (
        <div className="absolute inset-0 flex gap-1 p-4 z-10">
          {[0, 1, 2, 3, 4].map((colIndex) => (
            <button
              key={`col-click-${colIndex}`}
              onClick={() => canClick && onColumnClick && onColumnClick(colIndex)}
              className={`flex-1 h-full rounded-lg transition-all ${canClick ? "hover:bg-accent/10 hover:border-accent/50 border-2 border-transparent cursor-pointer" : "cursor-default"
                }`}
              disabled={!canClick}
            />
          ))}
        </div>
      )}

      {!isOpponent && (
        <div className="flex gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((col) => (
            <div key={col} className="w-14 text-center text-xs text-muted-foreground font-semibold">
              C{col}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}