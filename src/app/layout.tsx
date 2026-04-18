import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ANIME QUOTE — Угадай аниме по цитате',
  description: 'Угадай аниме по цитате персонажа',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="bg-bg text-text">{children}</body>
    </html>
  )
}