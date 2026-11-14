import { useState, useEffect, useCallback } from 'react'

const WINNING_COMBOS = [
  [0, 1, 2], // rows
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6], // columns
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8], // diagonals
  [2, 4, 6],
]

function checkWinner(board) {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo }
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { winner: 'tie', line: null }
  }
  return null
}

// Minimax algorithm for unbeatable AI
function minimax(board, depth, isMaximizing) {
  const result = checkWinner(board)
  if (result) {
    if (result.winner === 'O') return 10 - depth
    if (result.winner === 'X') return depth - 10
    if (result.winner === 'tie') return 0
  }

  if (isMaximizing) {
    let bestScore = -Infinity
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O'
        const score = minimax(board, depth + 1, false)
        board[i] = null
        bestScore = Math.max(score, bestScore)
      }
    }
    return bestScore
  } else {
    let bestScore = Infinity
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X'
        const score = minimax(board, depth + 1, true)
        board[i] = null
        bestScore = Math.min(score, bestScore)
      }
    }
    return bestScore
  }
}

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [gameMode, setGameMode] = useState('computer') // 'computer' | 'pvp'
  const [difficulty, setDifficulty] = useState('unbeatable') // 'easy' | 'medium' | 'unbeatable'
  const [isThinking, setIsThinking] = useState(false)
  const [scores, setScores] = useState({ x: 0, o: 0, ties: 0 })

  const winInfo = checkWinner(board)
  const isGameOver = !!winInfo

  // Computer AI move logic
  const makeComputerMove = useCallback(
    (currentBoard) => {
      const availableMoves = currentBoard
        .map((val, idx) => (val === null ? idx : null))
        .filter((val) => val !== null)

      if (availableMoves.length === 0) return

      let chosenMove = null

      if (difficulty === 'easy') {
        // Random move
        chosenMove = availableMoves[Math.floor(Math.random() * availableMoves.length)]
      } else if (difficulty === 'medium') {
        // 50% chance optimal, 50% chance random
        if (Math.random() < 0.5) {
          // Check for immediate win
          for (const move of availableMoves) {
            const boardCopy = [...currentBoard]
            boardCopy[move] = 'O'
            if (checkWinner(boardCopy)?.winner === 'O') {
              chosenMove = move
              break
            }
          }
          // Check for immediate block
          if (chosenMove === null) {
            for (const move of availableMoves) {
              const boardCopy = [...currentBoard]
              boardCopy[move] = 'X'
              if (checkWinner(boardCopy)?.winner === 'X') {
                chosenMove = move
                break
              }
            }
          }
        }
        if (chosenMove === null) {
          chosenMove = availableMoves[Math.floor(Math.random() * availableMoves.length)]
        }
      } else {
        // Unbeatable Minimax
        let bestScore = -Infinity
        for (const move of availableMoves) {
          const boardCopy = [...currentBoard]
          boardCopy[move] = 'O'
          const score = minimax(boardCopy, 0, false)
          if (score > bestScore) {
            bestScore = score
            chosenMove = move
          }
        }
      }

      if (chosenMove !== null) {
        const nextBoard = [...currentBoard]
        nextBoard[chosenMove] = 'O'
        setBoard(nextBoard)
        setIsXNext(true)
        setIsThinking(false)
      }
    },
    [difficulty]
  )

  // Trigger computer move when it's O's turn in 'computer' mode
  useEffect(() => {
    if (gameMode === 'computer' && !isXNext && !isGameOver) {
      setIsThinking(true)
      const timer = setTimeout(() => {
        makeComputerMove(board)
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [gameMode, isXNext, isGameOver, board, makeComputerMove])

  // Update scores on game over
  useEffect(() => {
    if (winInfo) {
      if (winInfo.winner === 'X') {
        setScores((s) => ({ ...s, x: s.x + 1 }))
      } else if (winInfo.winner === 'O') {
        setScores((s) => ({ ...s, o: s.o + 1 }))
      } else if (winInfo.winner === 'tie') {
        setScores((s) => ({ ...s, ties: s.ties + 1 }))
      }
    }
  }, [winInfo])

  const handleClick = (index) => {
    if (board[index] || isGameOver || (gameMode === 'computer' && !isXNext)) return

    const nextBoard = [...board]
    nextBoard[index] = isXNext ? 'X' : 'O'
    setBoard(nextBoard)
    setIsXNext(!isXNext)
  }

  const resetRound = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setIsThinking(false)
  }

  const resetMatch = () => {
    resetRound()
    setScores({ x: 0, o: 0, ties: 0 })
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Top Segmented Control: Game Mode */}
      <div className="flex items-center gap-1 bg-[#16171d] p-1 rounded-full border border-[#272832] mb-4">
        <button
          type="button"
          onClick={() => {
            setGameMode('computer')
            resetRound()
          }}
          className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-150 flex items-center gap-1.5 ${
            gameMode === 'computer'
              ? 'bg-[#3566EF] text-white shadow-sm'
              : 'text-[#9ca3af] hover:text-white'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <span>vs Computer</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setGameMode('pvp')
            resetRound()
          }}
          className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-150 flex items-center gap-1.5 ${
            gameMode === 'pvp'
              ? 'bg-[#3566EF] text-white shadow-sm'
              : 'text-[#9ca3af] hover:text-white'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>2 Players</span>
        </button>
      </div>

      {/* Difficulty Selector (when vs Computer) */}
      {gameMode === 'computer' && (
        <div className="flex items-center gap-1 bg-[#101115] p-1 rounded-full border border-[#272832] mb-4">
          <span className="text-[10px] text-[#71717a] uppercase font-semibold px-2">AI Level:</span>
          {(['easy', 'medium', 'unbeatable']).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => {
                setDifficulty(lvl)
                resetRound()
              }}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all capitalize ${
                difficulty === lvl
                  ? 'bg-[#272832] text-white'
                  : 'text-[#71717a] hover:text-[#d4d4d8]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      )}

      {/* Scoreboard Cards */}
      <div className="w-full grid grid-cols-3 gap-2 mb-5">
        <div className="bg-[#16171d] border border-[#272832] rounded-2xl p-3 text-center">
          <div className="text-xs font-medium text-[#9ca3af] mb-1">
            {gameMode === 'computer' ? 'You (X)' : 'Player X'}
          </div>
          <div className="text-2xl font-bold text-[#3566EF] font-mono">{scores.x}</div>
        </div>
        <div className="bg-[#16171d] border border-[#272832] rounded-2xl p-3 text-center">
          <div className="text-xs font-medium text-[#9ca3af] mb-1">Ties</div>
          <div className="text-2xl font-bold text-[#71717a] font-mono">{scores.ties}</div>
        </div>
        <div className="bg-[#16171d] border border-[#272832] rounded-2xl p-3 text-center">
          <div className="text-xs font-medium text-[#9ca3af] mb-1">
            {gameMode === 'computer' ? 'Computer (O)' : 'Player O'}
          </div>
          <div className="text-2xl font-bold text-[#f3f4f6] font-mono">{scores.o}</div>
        </div>
      </div>

      {/* Turn & Status Banner */}
      <div className="h-9 flex items-center justify-center mb-3">
        {isGameOver ? (
          <div className="text-sm font-semibold tracking-wide text-white flex items-center gap-2">
            {winInfo.winner === 'tie' ? (
              <span className="text-[#a1a1aa]">🤝 It&apos;s a Draw!</span>
            ) : (
              <span className="text-[#3566EF]">
                🎉 {winInfo.winner === 'X' ? (gameMode === 'computer' ? 'You Won!' : 'Player X Won!') : (gameMode === 'computer' ? 'Computer Won!' : 'Player O Won!')}
              </span>
            )}
          </div>
        ) : isThinking ? (
          <div className="flex items-center gap-2 text-xs text-[#9ca3af] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#3566EF]"></span>
            <span>Computer is calculating best move...</span>
          </div>
        ) : (
          <div className="text-xs font-medium text-[#a1a1aa] flex items-center gap-2">
            <span>Current Turn:</span>
            <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-xs ${
              isXNext ? 'bg-[#3566EF]/20 text-[#3566EF]' : 'bg-[#272832] text-white'
            }`}>
              {isXNext ? 'X' : 'O'}
            </span>
          </div>
        )}
      </div>

      {/* 3x3 Game Board */}
      <div className="grid grid-cols-3 gap-3 p-3 bg-[#111215] border border-[#272832] rounded-2xl shadow-xl w-full aspect-square max-w-[340px]">
        {board.map((cell, index) => {
          const isWinningCell = winInfo?.line?.includes(index)
          return (
            <button
              key={index}
              type="button"
              disabled={isGameOver || !!cell || (gameMode === 'computer' && !isXNext)}
              onClick={() => handleClick(index)}
              className={`relative flex items-center justify-center rounded-xl transition-all duration-200 select-none ${
                cell
                  ? 'bg-[#181920]'
                  : 'bg-[#15161d] hover:bg-[#1e202a] active:scale-95 cursor-pointer'
              } ${
                isWinningCell
                  ? 'border-2 border-[#3566EF] bg-[#3566EF]/10 shadow-[0_0_15px_rgba(53,102,239,0.3)]'
                  : 'border border-[#262734]'
              }`}
            >
              {cell === 'X' && (
                <svg
                  className="w-10 h-10 text-[#3566EF] animate-in zoom-in-50 duration-150"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              )}
              {cell === 'O' && (
                <svg
                  className="w-10 h-10 text-[#e4e4e7] animate-in zoom-in-50 duration-150"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9"></circle>
                </svg>
              )}
            </button>
          )
        })}
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-3 mt-5">
        <button
          type="button"
          onClick={resetRound}
          className="px-5 py-2.5 rounded-full bg-[#3566EF] hover:bg-[#2D51BF] text-white text-xs font-medium transition-all shadow-md shadow-[#3566EF]/20 flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
          <span>{isGameOver ? 'Next Round' : 'Reset Round'}</span>
        </button>

        <button
          type="button"
          onClick={resetMatch}
          className="px-4 py-2.5 rounded-full bg-[#181920] hover:bg-[#242632] text-[#9ca3af] hover:text-white text-xs font-medium border border-[#272832] transition-all"
        >
          Reset Scores
        </button>
      </div>
    </div>
  )
}

