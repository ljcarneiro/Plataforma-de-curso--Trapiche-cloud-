import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GFRJ Capacitação',
  description: 'Plataforma de capacitação técnica do Grupo de Foguetes Rio de Janeiro',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}