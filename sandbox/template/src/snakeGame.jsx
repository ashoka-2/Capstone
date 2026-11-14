import { useState, useEffect, useRef, useCallback } from 'react'

const GRID_SIZE = 20
const CELL_COUNT = 20
const CANVAS_SIZE = 400

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
}

export default function SnakeGame() {
  const canvasRef = useRef(null)
  const [snake, setSnake] = useState([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ])
  const [direction, setDirection] = useState(DIRECTIONS.UP)
  const nextDirectionRef = useRef(DIRECTIONS.UP)
  const [food, setFood] = useState({ x: 10, y: 5 })
  const [bonusFood, setBonusFood] = useState(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('sandbox_snake_high_score') || '0', 10)
  })
  const [gameState, setGameState] = useState('idle') // 'idle' | 'playing' | 'paused' | 'gameover'
  const [speed, setSpeed] = useState(120) // ms per tick
  const [difficulty, setDifficulty] = useState('normal') // 'chill' | 'normal' | 'fast'

  // Generate random food position not on snake
  const getRandomPosition = useCallback((currentSnake) => {
    while (true) {
      const pos = {
        x: Math.floor(Math.random() * CELL_COUNT),
        y: Math.floor(Math.random() * CELL_COUNT),
      }
      const onSnake = currentSnake.some(
        (segment) => segment.x === pos.x && segment.y === pos.y
      )
      if (!onSnake) return pos
    }
  }, [])

  // Start new game
  const startGame = useCallback(() => {
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ]
    setSnake(initialSnake)
    nextDirectionRef.current = DIRECTIONS.UP
    setDirection(DIRECTIONS.UP)
    setFood(getRandomPosition(initialSnake))
    setBonusFood(null)
    setScore(0)
    setGameState('playing')
  }, [getRandomPosition])

  const togglePause = useCallback(() => {
    if (gameState === 'playing') setGameState('paused')
    else if (gameState === 'paused') setGameState('playing')
  }, [gameState])

  // Speed mapping based on difficulty
  useEffect(() => {
    if (difficulty === 'chill') setSpeed(150)
    else if (difficulty === 'normal') setSpeed(110)
    else if (difficulty === 'fast') setSpeed(75)
  }, [difficulty])

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent scrolling on arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }

      if (e.key === ' ' || e.code === 'Space') {
        if (gameState === 'idle' || gameState === 'gameover') {
          startGame()
        } else {
          togglePause()
        }
        return
      }

      if (gameState !== 'playing') return

      const current = nextDirectionRef.current
      if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && current !== DIRECTIONS.DOWN) {
        nextDirectionRef.current = DIRECTIONS.UP
      } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && current !== DIRECTIONS.UP) {
        nextDirectionRef.current = DIRECTIONS.DOWN
      } else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && current !== DIRECTIONS.RIGHT) {
        nextDirectionRef.current = DIRECTIONS.LEFT
      } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && current !== DIRECTIONS.LEFT) {
        nextDirectionRef.current = DIRECTIONS.RIGHT
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, startGame, togglePause])

  // Main game tick loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const activeDir = nextDirectionRef.current
        setDirection(activeDir)

        const head = prevSnake[0]
        const newHead = {
          x: head.x + activeDir.x,
          y: head.y + activeDir.y,
        }

        // Wall collision check
        if (
          newHead.x < 0 ||
          newHead.x >= CELL_COUNT ||
          newHead.y < 0 ||
          newHead.y >= CELL_COUNT
        ) {
          setGameState('gameover')
          return prevSnake
        }

        // Self collision check
        if (prevSnake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
          setGameState('gameover')
          return prevSnake
        }

        const newSnake = [newHead, ...prevSnake]

        // Food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => {
            const nextScore = s + 10
            if (nextScore > highScore) {
              setHighScore(nextScore)
              localStorage.setItem('sandbox_snake_high_score', nextScore.toString())
            }
            return nextScore
          })
          setFood(getRandomPosition(newSnake))

          // 25% chance to spawn bonus food
          if (Math.random() < 0.25 && !bonusFood) {
            setBonusFood(getRandomPosition(newSnake))
          }
        } else if (bonusFood && newHead.x === bonusFood.x && newHead.y === bonusFood.y) {
          setScore((s) => {
            const nextScore = s + 35
            if (nextScore > highScore) {
              setHighScore(nextScore)
              localStorage.setItem('sandbox_snake_high_score', nextScore.toString())
            }
            return nextScore
          })
          setBonusFood(null)
        } else {
          // Remove tail if no food eaten
          newSnake.pop()
        }

        return newSnake
      })
    }, speed)

    return () => clearInterval(interval)
  }, [gameState, food, bonusFood, speed, highScore, getRandomPosition])

  // Canvas renderer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const cellSize = CANVAS_SIZE / CELL_COUNT

    // Clear background
    ctx.fillStyle = '#111215'
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Subtle background grid dots
    ctx.fillStyle = '#1c1d24'
    for (let x = 0; x < CELL_COUNT; x++) {
      for (let y = 0; y < CELL_COUNT; y++) {
        ctx.beginPath()
        ctx.arc(
          x * cellSize + cellSize / 2,
          y * cellSize + cellSize / 2,
          1,
          0,
          Math.PI * 2
        )
        ctx.fill()
      }
    }

    // Draw Bonus Food (if exists)
    if (bonusFood) {
      ctx.save()
      ctx.shadowColor = '#f59e0b'
      ctx.shadowBlur = 10
      ctx.fillStyle = '#f59e0b'
      ctx.beginPath()
      ctx.arc(
        bonusFood.x * cellSize + cellSize / 2,
        bonusFood.y * cellSize + cellSize / 2,
        cellSize / 2.3,
        0,
        Math.PI * 2
      )
      ctx.fill()
      ctx.restore()
    }

    // Draw Regular Food
    ctx.save()
    ctx.shadowColor = '#3566EF'
    ctx.shadowBlur = 8
    ctx.fillStyle = '#3566EF'
    ctx.beginPath()
    ctx.arc(
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      cellSize / 2.6,
      0,
      Math.PI * 2
    )
    ctx.fill()
    ctx.restore()

    // Draw Snake
    snake.forEach((segment, idx) => {
      const isHead = idx === 0
      const x = segment.x * cellSize
      const y = segment.y * cellSize
      const radius = isHead ? 6 : 4

      ctx.save()
      if (isHead) {
        ctx.fillStyle = '#60a5fa' // Head highlight
        ctx.shadowColor = 'rgba(96, 165, 250, 0.4)'
        ctx.shadowBlur = 6
      } else {
        // Gradient opacity towards the tail
        const progress = 1 - idx / (snake.length + 4)
        ctx.fillStyle = `rgba(53, 102, 239, ${Math.max(0.45, progress)})`
      }

      // Rounded rectangle for segments
      const pad = 1.5
      ctx.beginPath()
      ctx.roundRect(
        x + pad,
        y + pad,
        cellSize - pad * 2,
        cellSize - pad * 2,
        radius
      )
      ctx.fill()

      // Draw eyes on the head
      if (isHead) {
        ctx.fillStyle = '#ffffff'
        const eyeSize = 2.5
        let eye1 = { x: x + 6, y: y + 6 }
        let eye2 = { x: x + 14, y: y + 6 }

        if (direction === DIRECTIONS.DOWN) {
          eye1 = { x: x + 6, y: y + 14 }
          eye2 = { x: x + 14, y: y + 14 }
        } else if (direction === DIRECTIONS.LEFT) {
          eye1 = { x: x + 6, y: y + 6 }
          eye2 = { x: x + 6, y: y + 14 }
        } else if (direction === DIRECTIONS.RIGHT) {
          eye1 = { x: x + 14, y: y + 6 }
          eye2 = { x: x + 14, y: y + 14 }
        }

        ctx.beginPath()
        ctx.arc(eye1.x, eye1.y, eyeSize, 0, Math.PI * 2)
        ctx.arc(eye2.x, eye2.y, eyeSize, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    })
  }, [snake, food, bonusFood, direction])

  // Direct manual control handler for on-screen buttons
  const handleDirectionBtn = (newDir) => {
    if (gameState !== 'playing') return
    const cur = nextDirectionRef.current
    if (newDir === DIRECTIONS.UP && cur !== DIRECTIONS.DOWN) {
      nextDirectionRef.current = DIRECTIONS.UP
    } else if (newDir === DIRECTIONS.DOWN && cur !== DIRECTIONS.UP) {
      nextDirectionRef.current = DIRECTIONS.DOWN
    } else if (newDir === DIRECTIONS.LEFT && cur !== DIRECTIONS.RIGHT) {
      nextDirectionRef.current = DIRECTIONS.LEFT
    } else if (newDir === DIRECTIONS.RIGHT && cur !== DIRECTIONS.LEFT) {
      nextDirectionRef.current = DIRECTIONS.RIGHT
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      {/* Top Bar: Stats & Highscore */}
      <div className="w-full flex items-center justify-between bg-[#16171d] border border-[#272832] rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">Score</span>
            <span className="text-2xl font-bold text-[#f3f4f6] font-mono tracking-tight">{score}</span>
          </div>
          <div className="h-8 w-px bg-[#272832]" />
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">High Score</span>
            <span className="text-2xl font-bold text-[#3566EF] font-mono tracking-tight">{highScore}</span>
          </div>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-[#101115] p-1 rounded-full border border-[#272832]">
          {(['chill', 'normal', 'fast']).map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setDifficulty(diff)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-150 capitalize ${
                difficulty === diff
                  ? 'bg-[#3566EF] text-white'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative rounded-2xl overflow-hidden border border-[#272832] shadow-2xl bg-[#111215]">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block max-w-full h-auto w-[340px] sm:w-[400px]"
        />

        {/* Overlay: Idle State */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-[#0e0e11]/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#3566EF]/20 flex items-center justify-center text-[#3566EF] mb-4 border border-[#3566EF]/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Classic Snake</h3>
            <p className="text-xs text-[#9ca3af] max-w-xs mb-5">
              Navigate the grid, collect blue energy orbs, and don&apos;t run into walls or your own tail.
            </p>
            <button
              type="button"
              onClick={startGame}
              className="px-6 py-2.5 rounded-full bg-[#3566EF] hover:bg-[#2D51BF] text-white text-sm font-medium transition-all shadow-lg shadow-[#3566EF]/20 flex items-center gap-2"
            >
              <span>Start Game</span>
              <span className="text-xs opacity-75 font-mono">(Space)</span>
            </button>
          </div>
        )}

        {/* Overlay: Paused State */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-[#0e0e11]/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Game Paused</h3>
            <p className="text-xs text-[#9ca3af] mb-4">Take a breather while the AI works</p>
            <button
              type="button"
              onClick={togglePause}
              className="px-6 py-2.5 rounded-full bg-[#3566EF] hover:bg-[#2D51BF] text-white text-sm font-medium transition-all"
            >
              Resume Play
            </button>
          </div>
        )}

        {/* Overlay: Game Over */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-[#0e0e11]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-1">
              Game Over
            </div>
            <div className="text-3xl font-extrabold text-white font-mono mb-1">
              {score}
            </div>
            <div className="text-xs text-[#9ca3af] mb-5">
              {score >= highScore && score > 0 ? '✨ New High Score!' : `High Score: ${highScore}`}
            </div>
            <button
              type="button"
              onClick={startGame}
              className="px-6 py-2.5 rounded-full bg-[#3566EF] hover:bg-[#2D51BF] text-white text-sm font-medium transition-all shadow-lg shadow-[#3566EF]/20 flex items-center gap-2"
            >
              <span>Play Again</span>
              <span className="text-xs opacity-75 font-mono">(Space)</span>
            </button>
          </div>
        )}
      </div>

      {/* Control Actions & Touch D-Pad */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mt-5">
        {/* Play/Pause & Reset buttons */}
        <div className="flex items-center gap-2">
          {gameState === 'playing' ? (
            <button
              type="button"
              onClick={togglePause}
              className="px-4 py-2 rounded-full bg-[#1e2029] hover:bg-[#282a36] text-[#e4e4e7] text-xs font-medium border border-[#2e303d] flex items-center gap-1.5 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
              <span>Pause</span>
            </button>
          ) : gameState === 'paused' ? (
            <button
              type="button"
              onClick={togglePause}
              className="px-4 py-2 rounded-full bg-[#3566EF] hover:bg-[#2D51BF] text-white text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Resume</span>
            </button>
          ) : null}

          {(gameState === 'playing' || gameState === 'paused') && (
            <button
              type="button"
              onClick={startGame}
              className="px-4 py-2 rounded-full bg-[#1e2029] hover:bg-[#282a36] text-[#9ca3af] hover:text-white text-xs font-medium border border-[#2e303d] flex items-center gap-1.5 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              <span>Restart</span>
            </button>
          )}
        </div>

        {/* On-screen Directional Touch D-pad for mobile/click users */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            aria-label="Up"
            onClick={() => handleDirectionBtn(DIRECTIONS.UP)}
            className="w-10 h-10 rounded-full bg-[#1a1b22] hover:bg-[#252732] active:bg-[#3566EF] text-[#d4d4d8] hover:text-white border border-[#2e303e] flex items-center justify-center transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m18 15-6-6-6 6"/>
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Left"
              onClick={() => handleDirectionBtn(DIRECTIONS.LEFT)}
              className="w-10 h-10 rounded-full bg-[#1a1b22] hover:bg-[#252732] active:bg-[#3566EF] text-[#d4d4d8] hover:text-white border border-[#2e303e] flex items-center justify-center transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            <button
              type="button"
              aria-label="Down"
              onClick={() => handleDirectionBtn(DIRECTIONS.DOWN)}
              className="w-10 h-10 rounded-full bg-[#1a1b22] hover:bg-[#252732] active:bg-[#3566EF] text-[#d4d4d8] hover:text-white border border-[#2e303e] flex items-center justify-center transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            <button
              type="button"
              aria-label="Right"
              onClick={() => handleDirectionBtn(DIRECTIONS.RIGHT)}
              className="w-10 h-10 rounded-full bg-[#1a1b22] hover:bg-[#252732] active:bg-[#3566EF] text-[#d4d4d8] hover:text-white border border-[#2e303e] flex items-center justify-center transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-4 text-xs text-[#71717a] flex items-center gap-2">
        <span>Use Arrow Keys or WASD to navigate</span>
        <span>•</span>
        <span>Space to Pause/Resume</span>
      </div>
    </div>
  )
}

