import { useState } from 'react'
import SnakeGame from './snakeGame'
import TicTacToe from './tictactoe'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('snake') // 'snake' | 'tictactoe'

  return (
    <div className="min-h-screen bg-[#0e0e11] text-[#f4f4f5] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#3566EF]/30 selection:text-white">
      {/* Top Header & Navigation */}
      <header className="w-full max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[#20212a]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#3566EF]/15 border border-[#3566EF]/30 flex items-center justify-center text-[#3566EF]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight leading-none m-0">
              Sandbox Playground
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs text-[#9ca3af]">AI Generation In Progress</span>
            </div>
          </div>
        </div>

        {/* Game Switcher Tabs */}
        <div className="flex items-center bg-[#16171e] p-1 rounded-full border border-[#272834]">
          <button
            type="button"
            onClick={() => setActiveTab('snake')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === 'snake'
                ? 'bg-[#3566EF] text-white shadow-sm'
                : 'text-[#9ca3af] hover:text-white'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 1 0 10 10"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>Snake Game</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tictactoe')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === 'tictactoe'
                ? 'bg-[#3566EF] text-white shadow-sm'
                : 'text-[#9ca3af] hover:text-white'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="15" y1="3" x2="15" y2="21"></line>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="3" y1="15" x2="21" y2="15"></line>
            </svg>
            <span>Tic Tac Toe</span>
          </button>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="flex-1 flex flex-col items-center justify-center my-6 w-full">
        <div className="w-full max-w-xl animate-fade-in transition-all">
          {activeTab === 'snake' ? <SnakeGame /> : <TicTacToe />}
        </div>
      </main>

      {/* Bottom Quiet Footer */}
      <footer className="w-full max-w-3xl mx-auto pt-4 border-t border-[#20212a] flex flex-col sm:flex-row items-center justify-between text-xs text-[#71717a] gap-2">
        <div className="flex items-center gap-2">
          <span>Sandbox Ready</span>
          <span>•</span>
          <span>Your generated app will live replace this screen once ready</span>
        </div>
        <div className="font-mono text-[11px] text-[#52525b]">
          Vite + React HMR Active
        </div>
      </footer>
    </div>
  )
}
