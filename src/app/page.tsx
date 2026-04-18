'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'

type View = 'home' | 'game' | 'profile' | 'ratings'

function Dots({ current, answers }: { current: number, answers: boolean[] }) {
  return (
    <div className="flex gap-2">
      {answers.map((_, i) => (
        <div
          key={i}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            border: i === current ? '1px solid #f43f5e' : answers[i] ? '1px solid #10b981' : answers[i] === false ? '1px solid #ef4444' : '1px solid #1e1e2e',
            background: i === current ? 'rgba(244,63,94,0.1)' : answers[i] ? 'rgba(16,185,129,0.1)' : answers[i] === false ? 'rgba(239,68,68,0.1)' : 'transparent'
          }}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const [view, setView] = useState<View>('home')
  const [answer, setAnswer] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)
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

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ message: msg, type })
  }

  const handleStartGame = () => {
    if (!store.username.trim()) {
      showToast('Введите имя!', 'error')
      return
    }
    setShowResult(false)
    setAnswer('')
    setHint(null)
    setLastCorrect(false)
    store.startGame('all')
    setView('game')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim()) {
      showToast('Введите название!', 'error')
      return
    }
    const correct = store.answerQuestion(answer)
    setLastCorrect(correct)
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
    setLastCorrect(false)
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

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.28, background: 'radial-gradient(circle, #f43f5e, transparent 70%)', top: '-10%', left: '-10%' }} />
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.28, background: 'radial-gradient(circle, #8b5cf6, transparent 70%)', bottom: '-10%', right: '-10%' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, paddingBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
          <motion.h1 
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('home')}
            style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f43f5e', letterSpacing: '0.1em', cursor: 'pointer' }}
          >
            ANIME QUOTE
          </motion.h1>
          {store.username && (
            <nav style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem' }}>
              <button onClick={() => setView('ratings')} style={{ color: '#6b6b80' }}>Рейтинг</button>
              <button onClick={() => setView('profile')} style={{ color: '#6b6b80' }}>Профиль</button>
            </nav>
          )}
        </div>
        <div style={{ maxWidth: '28rem', margin: '0 auto', padding: '0 1rem' }}>

        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '0.1em', color: '#f43f5e' }}>
                  ANIME QUOTE
                </h2>
                <p style={{ color: '#6b6b80', marginTop: '0.75rem' }}>Угадай аниме по цитате</p>
              </div>

              <div>
                <h3 style={{ color: '#6b6b80', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', textAlign: 'center' }}>Играть</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {!store.username ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Ваше имя"
                      style={{ width: '100%', padding: '0.75rem 1rem', background: '#16161f', border: '1px solid #1e1e2e', color: '#eaeaf0', borderRadius: '0.75rem' }}
                    />
                    <button
                      onClick={() => {
                        if (usernameInput.trim().length >= 2) {
                          store.setUsername(usernameInput.trim())
                        } else {
                          showToast('Минимум 2 символа!', 'error')
                        }
                      }}
                      style={{ background: '#111119', border: '1px solid #1e1e2e', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontWeight: 700, color: '#eaeaf0' }}
                    >
                      Играть
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#111119', borderRadius: '0.75rem', border: '1px solid #1e1e2e' }}>
                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem' }}>
                      {store.username[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{store.username}</div>
                    </div>
                    <button
                      onClick={() => store.logout()}
                      style={{ color: '#ef4444', fontSize: '0.875rem' }}
                    >
                      Выйти
                    </button>
                  </div>
                )}
                {store.username && (
                  <button
                    onClick={handleStartGame}
                    style={{ background: '#f43f5e', color: '#fff', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontWeight: 700 }}
                  >
                    ИГРАТЬ
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {view === 'game' && isPlaying && currentAnime && !showEndModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <button onClick={() => { store.resetGame(); setView('home') }} style={{ color: '#6b6b80' }}>
                  ← Назад
                </button>
                <Dots current={currentQuestion} answers={answers} />
                <div style={{ color: '#f43f5e', fontWeight: 700 }}>⭐ {score}</div>
              </div>

              <div style={{ background: '#111119', border: '1px solid #1e1e2e', borderRadius: '1rem', padding: '1.25rem', textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>💬</div>
                <div style={{ fontSize: '1.25rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>"{currentAnime.quote}"</div>
                <div style={{ color: '#6b6b80', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>— персонаж</div>
                <div style={{ color: '#f43f5e', fontSize: '0.875rem', marginTop: '0.5rem' }}>⭐ {Math.max(2, 5 - hintsUsed)} баллов</div>
              </div>

              {hint && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: '0.75rem', padding: '0.5rem 1rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '0.5rem', color: '#f43f5e', fontSize: '0.875rem' }}
                >
                  💡 {hint}
                </motion.div>
              )}

              {!showResult ? (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Название аниме"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: '#16161f', border: '1px solid #1e1e2e', color: '#eaeaf0', borderRadius: '0.75rem' }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={handleUseHint}
                      disabled={hintsUsed >= 3}
                      style={{ background: '#111119', border: '1px solid #1e1e2e', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontWeight: 700, color: hintsUsed >= 3 ? '#6b6b80' : '#6b6b80', flex: 1, opacity: hintsUsed >= 3 ? 0.5 : 1 }}
                    >
                      💡 Подсказка {hintsUsed}/3
                    </button>
                    <button type="submit" style={{ background: '#f43f5e', color: '#fff', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontWeight: 700, flex: 1.5 }}>
                      УГАДАТЬ
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      store.answerQuestion('')
                      setLastCorrect(false)
                      setShowResult(true)
                      setHint(null)
                    }}
                    style={{ background: '#111119', border: '1px solid #1e1e2e', padding: '0.5rem 1rem', borderRadius: '0.75rem', fontWeight: 700, color: '#eaeaf0', fontSize: '0.875rem' }}
                  >
                    Пропустить →
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  style={{ background: '#111119', border: '1px solid #1e1e2e', borderRadius: '1rem', padding: '1.25rem', textAlign: 'center' }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem', color: lastCorrect ? '#10b981' : '#ef4444' }}>
                    {lastCorrect ? '✓' : '✗'}
                  </div>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: lastCorrect ? '#10b981' : '#ef4444' }}>
                    {lastCorrect ? 'Правильно!' : 'Не угадал'}
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f43f5e', marginBottom: '0.25rem' }}>{currentAnime.name}</div>
                  <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{currentAnime.emoji}</div>
                  <div style={{ display: 'inline-block', padding: '0.25rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem', background: lastCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: lastCorrect ? '#10b981' : '#ef4444' }}>
                    {lastCorrect ? `+${Math.max(2, 5 - hintsUsed)} баллов` : '0 баллов'}
                  </div>
                  <button onClick={currentQuestion < 4 ? handleNext : handleEndGame} style={{ background: '#f43f5e', color: '#fff', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontWeight: 700, width: '100%' }}>
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
              <button onClick={() => setView('home')} style={{ color: '#6b6b80', marginBottom: '1rem' }}>
                ← Назад
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  {store.username ? store.username[0].toUpperCase() : '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>{store.username || 'Игрок'}</div>
                </div>
              </div>

              <div style={{ background: '#111119', border: '1px solid #1e1e2e', borderRadius: '1rem', padding: '1.25rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '1.875rem', fontWeight: 900, color: '#f43f5e' }}>{store.bestScore}</div>
                <div style={{ color: '#6b6b80', fontSize: '0.75rem' }}>Лучший счёт</div>
              </div>

              <div style={{ textAlign: 'center', color: '#6b6b80', fontSize: '0.875rem', marginBottom: '1rem' }}>{store.gamesPlayed} игр сыграно</div>

              <h3 style={{ color: '#6b6b80', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>История игр</h3>
              {store.history.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6b6b80', padding: '2rem 0' }}>Нет сыгранных игр</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {store.history.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#111119', borderRadius: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#f43f5e' }}>{item.score} баллов</div>
                        <div style={{ color: '#6b6b80', fontSize: '0.75rem' }}>Угадано {item.correct}/5 · {item.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => store.setUsername('')}
                style={{ background: '#111119', border: '1px solid #1e1e2e', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontWeight: 700, color: '#ef4444', width: '100%', marginTop: '1.5rem' }}
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
              <button onClick={() => setView('home')} style={{ color: '#6b6b80', marginBottom: '1rem' }}>
                ← Назад
              </button>

              {store.getLeaderboard('all').length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6b6b80', padding: '3rem 0' }}>
                  <div style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>🎮</div>
                  <p>Нет игроков в рейтинге</p>
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Играйте, чтобы попасть в топ!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {store.getLeaderboard('all').map((entry, i) => (
                    <div
                      key={i}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', background: entry.isCurrentUser ? 'rgba(244,63,94,0.1)' : '#111119', border: entry.isCurrentUser ? '1px solid rgba(244,63,94,0.3)' : '1px solid #1e1e2e' }}
                    >
                      <div style={{ fontWeight: 900, width: '1.5rem', color: i === 0 ? '#fbbf24' : i === 1 ? '#9ca3af' : i === 2 ? '#d97706' : '#6b6b80' }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, fontWeight: 700 }}>
                        {entry.name}
                        {entry.isCurrentUser && <span style={{ color: '#f43f5e', marginLeft: '0.5rem' }}>(Вы)</span>}
                      </div>
                      <div style={{ fontWeight: 700, color: '#f43f5e' }}>
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
            style={{ position: 'fixed', top: '1.25rem', left: '50%', transform: 'translateX(-50%)', zIndex: 50, padding: '0.75rem 1.25rem', borderRadius: '0.75rem', fontWeight: 600, color: '#fff', background: toast.type === 'success' ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)' }}
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
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(4px)' }}
            onClick={handleGoHome}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              style={{ background: '#111119', border: '1px solid #1e1e2e', borderRadius: '1rem', padding: '1.5rem', maxWidth: '24rem', width: '100%', textAlign: 'center' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>🏆</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>ИГРА ЗАВЕРШЕНА</h2>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: '#f43f5e', marginBottom: '1rem' }}>{score}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem', color: '#6b6b80' }}>
                <div>✓ Угадано {answers.filter(a => a).length}</div>
                <div>✗ Пропущено {answers.filter(a => !a).length}</div>
              </div>
              <button onClick={handlePlayAgain} style={{ background: '#f43f5e', color: '#fff', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontWeight: 700, width: '100%', marginBottom: '0.75rem' }}>
                Играть снова
              </button>
              <button onClick={handleGoHome} style={{ background: '#111119', border: '1px solid #1e1e2e', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontWeight: 700, color: '#6b6b80', width: '100%' }}>
                В меню
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}