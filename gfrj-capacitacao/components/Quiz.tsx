'use client'
import { useState } from 'react'
import type { Quiz } from '../lib/types'

export default function QuizComponent({ quiz }: { quiz: Quiz }) {
  const [respostas, setRespostas] = useState<Record<string, number | null>>({})

  function responder(perguntaId: string, idx: number) {
    if (respostas[perguntaId] !== undefined) return
    setRespostas(prev => ({ ...prev, [perguntaId]: idx }))
  }

  const total = quiz.perguntas.length
  const respondidas = Object.keys(respostas).length
  const acertos = quiz.perguntas.filter(p => respostas[p.id] === p.correta).length

  return (
    <div className="quiz-section">
      <p className="quiz-title">
        Quiz da trilha
        {respondidas === total && ` — ${acertos}/${total} corretas`}
      </p>

      {quiz.perguntas.map((p, pi) => {
        const resposta = respostas[p.id]
        const respondida = resposta !== undefined && resposta !== null

        return (
          <div key={p.id} className="quiz-pergunta">
            <p className="quiz-enunciado">{pi + 1}. {p.enunciado}</p>
            <div className="quiz-opcoes">
              {p.alternativas.map((alt, idx) => {
                let className = 'quiz-opcao'
                if (respondida) {
                  if (idx === p.correta) className += ' correta'
                  else if (idx === resposta) className += ' errada'
                }
                return (
                  <button
                    key={idx}
                    className={className}
                    onClick={() => responder(p.id, idx)}
                    disabled={respondida}
                  >
                    {alt}
                  </button>
                )
              })}
            </div>
            {respondida && (
              <p className={`quiz-feedback ${respostas[p.id] === p.correta ? 'ok' : 'err'}`}>
                {respostas[p.id] === p.correta ? '✓ Correto!' : `✗ Resposta correta: ${p.alternativas[p.correta]}`}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}