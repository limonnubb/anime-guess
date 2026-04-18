'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { animeQuotes } from '@/data/anime'

type View = 'home' | 'game' | 'profile' | 'ratings'

export default function Home() {
  const [view, setView] = useState<View>('home')
  const [answer, setAnswer] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false)
  const [showEndModal, setShowEndModal] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const [usernameInput, setUsernameInput] = useState('')

  const store = useGameStore()
  const { isPlaying, currentQuestion, score, hintsUsed, questions, answers, isTwitchAuth } = store

  const currentAnime = questions[currentQuestion]

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500)
      return () => clearTimeout(t)
    }
  }, [toast])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }

  const handleStartGame = () => {
    if (!store.username.trim()) {
      showToast('Введите имя!', 'error')
      return
    }
    setShowResult(false)
    setAnswer('')
    setHint(null)
    setLastAnswerCorrect(false)
    store.startGame('all')
    setView('game')
  }

  const handleAnswerChange = (value: string) => {
    setAnswer(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim()) {
      showToast('Введите название!', 'error')
      return
    }
    
    const correct = store.answerQuestion(answer)
    setLastAnswerCorrect(correct)
    setShowResult(true)
    setHint(null)
  }

  const handleNext = () => {
    setShowResult(false)
    setAnswer('')
    setHint(null)
    store.nextQuestion()
  }

  const handleEndGame = () => {
    store.endGame()
    setShowEndModal(true)
  }

  const handlePlayAgain = () => {
    setShowEndModal(false)
    setShowResult(false)
    setAnswer('')
    setHint(null)
    setLastAnswerCorrect(false)
    store.startGame('all')
  }

  const handleUseHint = () => {
    const h = store.useHint()
    if (h) setHint(h)
  }

  const handleGoHome = () => {
    setShowEndModal(false)
    store.resetGame()
    setView('home')
  }

  const renderDots = () => (
    <div className="flex gap-2">
      {questions.map((_, i) => (
        <div
          key={i}
          className={`dot ${
            i === currentQuestion ? 'dot-current' :
            answers[i] === true ? 'dot-correct' :
            answers[i] === false ? 'dot-wrong' : 'bg-border'
          }`}
        />
      ))}
    </div>
  )

  return (
    <div className="min-h-screen relative">
      <div className="orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      <div className="relative z-10 pb-10">
        <div className="flex items-center justify-between py-4 px-4">
          <motion.h1 
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('home')}
            className="text-xl font-bold text-accent tracking-wider cursor-pointer"
          >
            ANIME QUOTE
          </motion.h1>
          {store.username && (
            <nav className="flex gap-3 text-sm">
              <button onClick={() => setView('ratings')} className="text-muted hover:text-text">Рейтинг</button>
              <button onClick={() => setView('profile')} className="text-muted hover:text-text">Профиль</button>
            </nav>
          )}
        </div>
        <div className="max-w-md mx-auto px-4">

        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <section className="text-center py-8">
                <h2 className="text-4xl font-black tracking-wider text-accent">
                  ANIME QUOTE
                </h2>
                <p className="text-muted mt-3">Угадай аниме по цитате</p>
              </section>

              <section>
                <h3 className="text-muted text-xs uppercase tracking-widest mb-4 text-center">Играть</h3>
                <div className="flex flex-col gap-3">
                  {!store.username ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="Ваше имя (мин. 2 символа)"
                        className="input w-full"
                        minLength={2}
                      />
                      <button
                        onClick={() => {
                          if (usernameInput.trim().length >= 2) {
                            store.setUsername(usernameInput.trim())
                          } else {
                            showToast('Минимум 2 символа!', 'error')
                          }
                        }}
                        className="btn btn-outline w-full"
                      >
                        Играть
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-card rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-lg">
                        {store.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold">{store.username}</div>
                      </div>
                      <button
                        onClick={() => store.logout()}
                        className="text-muted hover:text-err text-sm"
                      >
                        Выйти
                      </button>
                    </div>
                  )}
                  {store.username && (
                    <button
                      onClick={handleStartGame}
                      className="btn btn-primary w-full"
                    >
                      ИГРАТЬ
                    </button>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {view === 'game' && isPlaying && currentAnime && !showEndModal && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => { store.resetGame(); setView('home') }} className="text-muted hover:text-text">
                  ← Назад
                </button>
                {renderDots()}
                <div className="text-accent font-bold">⭐ {score}</div>
              </div>

              <div className="card text-center mb-4">
                <div className="text-3xl mb-2">💬</div>
                <div className="text-xl italic mb-2">"{currentAnime.quote}"</div>
                <div className="text-xs text-muted uppercase tracking-widest">— персонаж</div>
                <div className="text-accent text-sm mt-2">⭐ {Math.max(2, 5 - hintsUsed)} баллов</div>
              </div>

              <AnimatePresence>
                {hint && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 px-4 py-2 bg-accent/10 border border-accent/30 rounded-lg text-accent text-sm"
                  >
                    💡 {hint}
                  </motion.div>
                )}
              </AnimatePresence>

              {!showResult ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Название аниме"
                    className="input w-full"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleUseHint}
                      disabled={hintsUsed >= 3}
                      className="btn btn-secondary flex-1 disabled:opacity-50"
                    >
                      💡 Подсказка {hintsUsed}/3
                    </button>
                    <button type="submit" className="btn btn-primary flex-1.5 text-base">
                      УГАДАТЬ
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      store.answerQuestion('')
                      setLastAnswerCorrect(false)
                      setShowResult(true)
                      setHint(null)
                    }}
                    className="btn btn-outline w-full text-sm mt-2"
                  >
                    Пропустить →
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="card text-center"
                >
                  <div className={`text-5xl mb-2 ${lastAnswerCorrect ? 'text-ok' : 'text-err'}`}>
                    {lastAnswerCorrect ? '✓' : '✗'}
                  </div>
                  <div className={`font-bold mb-1 ${lastAnswerCorrect ? 'text-ok' : 'text-err'}`}>
                    {lastAnswerCorrect ? 'Правильно!' : 'Не угадал'}
                  </div>
                  <div className="text-lg font-bold text-accent mb-1">{currentAnime.name}</div>
                  <div className="text-2xl mb-4">{currentAnime.emoji}</div>
                  <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold mb-4 ${
                    lastAnswerCorrect ? 'bg-ok/20 text-ok' : 'bg-err/20 text-err'
                  }`}>
                    {lastAnswerCorrect ? `+${Math.max(2, 5 - hintsUsed)} баллов` : '0 баллов'}
                  </div>
                  <button onClick={currentQuestion < 4 ? handleNext : handleEndGame} className="btn btn-primary w-full">
                    {currentQuestion < 4 ? 'СЛЕДУЮЩИЙ →' : 'РЕЗУЛЬТАТЫ'}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {view === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <button onClick={() => setView('home')} className="text-muted hover:text-text mb-4">
                ← Назад
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-2xl">
                  {store.username ? store.username[0].toUpperCase() : '?'}
                </div>
                <div>
                  <div className="font-bold text-xl">{store.username || 'Игрок'}</div>
                </div>
              </div>

              <div className="card text-center mb-6">
                <div className="text-3xl font-black text-accent">{store.bestScore}</div>
                <div className="text-muted text-xs">Лучший счёт</div>
              </div>

              <div className="text-center text-muted text-sm mb-4">{store.gamesPlayed} игр сыграно</div>

              <h3 className="text-muted text-xs uppercase tracking-widest mb-4">История игр</h3>
              {store.history.length === 0 ? (
                <div className="text-center text-muted py-8">Нет сыгранных игр</div>
              ) : (
                <div className="space-y-2">
                  {store.history.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-card rounded-lg">
                      <div>
                        <div className="font-bold text-accent">{item.score} баллов</div>
                        <div className="text-muted text-xs">Угадано {item.correct}/5 · {item.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => store.setUsername('')}
                className="btn btn-outline w-full mt-6 text-err"
              >
                Сменить имя
              </button>
            </motion.div>
          )}

          {view === 'ratings' && (
            <motion.div
              key="ratings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <button onClick={() => setView('home')} className="text-muted hover:text-text mb-4">
                ← Назад
              </button>

              {store.getLeaderboard('all').length === 0 ? (
                <div className="text-center text-muted py-12">
                  <div className="text-4xl mb-4">🎮</div>
                  <p>Нет игроков в рейтинге</p>
                  <p className="text-sm mt-2">Играйте, чтобы попасть в топ!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {store.getLeaderboard('all').map((entry, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        entry.isCurrentUser ? 'bg-accent/10 border border-accent/30' : 'bg-card'
                      }`}
                    >
                      <div className={`font-black w-6 ${
                        i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-muted'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 font-bold">
                        {entry.name}
                        {entry.isCurrentUser && <span className="text-accent ml-2">(Вы)</span>}
                      </div>
                      <div className="font-bold text-accent">
                        {entry.score}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEndModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={handleGoHome}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="modal text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-black mb-2">ИГРА ЗАВЕРШЕНА</h2>
              <div className="text-5xl font-black text-accent mb-4">{score}</div>
              <div className="flex justify-center gap-8 mb-6 text-muted">
                <div>✓ Угадано {answers.filter(a => a).length}</div>
                <div>✗ Пропущено {answers.filter(a => !a).length}</div>
              </div>
              <button onClick={handlePlayAgain} className="btn btn-primary w-full mb-3">
                Играть снова
              </button>
              <button onClick={handleGoHome} className="btn btn-secondary w-full">
                В меню
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}