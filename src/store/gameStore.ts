import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { animeQuotes } from '@/data/anime'

type GameState = {
  username: string
  isPlaying: boolean
  currentQuestion: number
  questions: { name: string; quote: string; emoji: string }[]
  answers: boolean[]
  score: number
  hintsUsed: number
  bestScore: number
  bestScoreFilm: number
  bestScoreSerial: number
  gamesPlayed: number
  history: { score: number; correct: number; date: string }[]
  isTwitchAuth: boolean
  leaderboard: { name: string; score: number; mode: string; isTwitch: boolean }[]
  
  setUsername: (name: string) => void
  loginWithTwitch: (name: string) => void
  logout: () => void
  startGame: (mode: string) => void
  answerQuestion: (answer: string) => boolean
  useHint: () => string | null
  nextQuestion: () => void
  endGame: () => void
  resetGame: () => void
  getLeaderboard: (mode: string) => { name: string; score: number; mode: string; isTwitch: boolean; isCurrentUser: boolean }[]
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, 5)
}

const normalizeAnswer = (answer: string, correct: string): boolean => {
  const a = answer.toLowerCase().trim()
  const c = correct.toLowerCase().trim()
  return a === c || a.includes(c) || c.includes(a)
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      username: '',
      isPlaying: false,
      currentQuestion: 0,
      questions: [],
      answers: [],
      score: 0,
      hintsUsed: 0,
      bestScore: 0,
      bestScoreFilm: 0,
      bestScoreSerial: 0,
      gamesPlayed: 0,
      history: [],
      isTwitchAuth: false,
      leaderboard: [],

      setUsername: (name) => set({ username: name, isTwitchAuth: false }),
      
      loginWithTwitch: (name) => set({ username: name, isTwitchAuth: true }),
      
      logout: () => set({ username: '', isTwitchAuth: false, isPlaying: false }),
      
      startGame: (mode) => {
        const shuffled = shuffleArray(animeQuotes)
        set({
          isPlaying: true,
          currentQuestion: 0,
          questions: shuffled,
          answers: [],
          score: 0,
          hintsUsed: 0,
        })
      },
      
      answerQuestion: (answer) => {
        const state = get()
        const current = state.questions[state.currentQuestion]
        const correct = normalizeAnswer(answer, current.name)
        
        const newAnswers = [...state.answers, correct]
        const newScore = state.score + (correct ? Math.max(2, 5 - state.hintsUsed) : 0)
        
        set({ answers: newAnswers, score: newScore })
        return correct
      },
      
      useHint: () => {
        const state = get()
        if (state.hintsUsed >= 3) return null
        
        const current = state.questions[state.currentQuestion]
        const hint = `Начинается на "${current.name[0]}" или содержит "${current.name.slice(0, 2)}"`
        
        set({ hintsUsed: state.hintsUsed + 1 })
        return hint
      },
      
      nextQuestion: () => {
        set({ currentQuestion: get().currentQuestion + 1, hintsUsed: 0 })
      },
      
      endGame: () => {
        const state = get()
        const correct = state.answers.filter(Boolean).length
        const newBestScore = Math.max(state.bestScore, state.score)
        
        const newHistory = [
          ...state.history,
          { score: state.score, correct, date: new Date().toLocaleDateString('ru') }
        ].slice(-10)
        
        const newLeaderboard = [
          ...state.leaderboard,
          { name: state.username, score: state.score, mode: 'all', isTwitch: state.isTwitchAuth }
        ].sort((a, b) => b.score - a.score).slice(0, 100)
        
        set({
          isPlaying: false,
          bestScore: newBestScore,
          gamesPlayed: state.gamesPlayed + 1,
          history: newHistory,
          leaderboard: newLeaderboard,
        })
      },
      
      resetGame: () => set({
        isPlaying: false,
        currentQuestion: 0,
        questions: [],
        answers: [],
        score: 0,
        hintsUsed: 0,
      }),
      
      getLeaderboard: (mode) => {
        const state = get()
        return state.leaderboard
          .filter(e => mode === 'all' || e.mode === mode)
          .map(e => ({ ...e, isCurrentUser: e.name === state.username }))
      },
    }),
    { name: 'anime-guess-storage' }
  )
)