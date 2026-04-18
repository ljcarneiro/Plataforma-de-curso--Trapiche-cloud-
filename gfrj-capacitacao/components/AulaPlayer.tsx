'use client'
import { useState, useEffect } from 'react'
import type { Trilha } from '../lib/types.ts'

interface Props {
  trilhas: Trilha[]
  cor: string
  nome: string
  slug: string
}

export default function CoursePlayer({ trilhas, cor, nome, slug }: Props) {
  const todasAulas = trilhas.flatMap((t, ti) =>
    t.aulas.map((a, ai) => ({ ...a, capituloIdx: ti, aulaIdx: ai, capituloTitulo: t.titulo }))
  )

  const [capituloAberto, setCapituloAberto] = useState(0)
  const [aulaAtual, setAulaAtual] = useState(todasAulas[0] ?? null)
  const [mostraQuiz, setMostraQuiz] = useState(false)
  const [respostas, setRespostas] = useState<Record<string, number>>({})
  const [concluidas, setConcluidas] = useState<Set<string>>(new Set())

  // Carrega progresso do localStorage
  useEffect(() => {
    const salvo = localStorage.getItem(`gfrj-progresso-${slug}`)
    if (salvo) setConcluidas(new Set(JSON.parse(salvo)))
  }, [slug])

  // Salva progresso no localStorage
  function marcarConcluida(id: string) {
    setConcluidas(prev => {
      const novo = new Set(prev)
      novo.add(id)
      localStorage.setItem(`gfrj-progresso-${slug}`, JSON.stringify([...novo]))
      return novo
    })
  }

  const idxGlobal = todasAulas.findIndex(a => a.id === aulaAtual?.id)
  const total = todasAulas.length
  const progresso = total > 0 ? Math.round((concluidas.size / total) * 100) : 0

  function irPara(aula: typeof todasAulas[0]) {
    setAulaAtual(aula)
    setMostraQuiz(false)
    setRespostas({})
    setCapituloAberto(aula.capituloIdx)
  }

  function anterior() {
    if (mostraQuiz) { setMostraQuiz(false); return }
    if (idxGlobal > 0) irPara(todasAulas[idxGlobal - 1])
  }

  function proximo() {
    const trilhaAtual = trilhas[aulaAtual?.capituloIdx ?? 0]
    const ultimaAulaDoCap = aulaAtual?.aulaIdx === trilhaAtual.aulas.length - 1
    if (ultimaAulaDoCap && !mostraQuiz) {
      if (aulaAtual) marcarConcluida(aulaAtual.id)
      setMostraQuiz(true)
      setRespostas({})
      return
    }
    if (mostraQuiz) {
      if (idxGlobal < total - 1) { irPara(todasAulas[idxGlobal + 1]); return }
      return
    }
    if (aulaAtual) marcarConcluida(aulaAtual.id)
    if (idxGlobal < total - 1) irPara(todasAulas[idxGlobal + 1])
  }

  function responder(perguntaId: string, idx: number) {
    if (respostas[perguntaId] !== undefined) return
    setRespostas(prev => ({ ...prev, [perguntaId]: idx }))
  }

  const trilhaAtual = aulaAtual ? trilhas[aulaAtual.capituloIdx] : null
  const quiz = trilhaAtual?.quiz
  const todasRespondidas = quiz ? Object.keys(respostas).length === quiz.perguntas.length : false
  const acertos = quiz ? quiz.perguntas.filter(p => respostas[p.id] === p.correta).length : 0

  const podeProximo = mostraQuiz ? todasRespondidas : true
  const podeAnterior = !(idxGlobal === 0 && !mostraQuiz)

  return (
    <div className="player-layout">
      {/* Área principal */}
      <div className="player-main">

        {/* Breadcrumb */}
        <div className="player-breadcrumb">
          <span>{nome}</span>
          <span className="breadcrumb-sep">›</span>
          <span>{aulaAtual?.capituloTitulo}</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-atual">{mostraQuiz ? 'Quiz' : aulaAtual?.titulo}</span>
        </div>

        {/* Header */}
        <div className="player-header">
          <div className="player-header-info">
            <span className="player-capitulo-label" style={{ color: cor }}>
              {aulaAtual?.capituloTitulo}
            </span>
            <h1 className="player-aula-titulo">
              {mostraQuiz ? 'Quiz do capítulo' : aulaAtual?.titulo}
            </h1>
          </div>
          <div className="player-nav">
            <button className="player-nav-btn" onClick={anterior} disabled={!podeAnterior}>←</button>
            <button
              className="player-nav-btn"
              onClick={proximo}
              disabled={!podeProximo || (idxGlobal === total - 1 && mostraQuiz)}
              style={podeProximo ? { borderColor: cor, color: cor } : {}}
            >→</button>
          </div>
        </div>

        {/* Vídeo */}
        {!mostraQuiz ? (
          <>
            <div className="player-video">
              <iframe
                key={aulaAtual?.id}
                src={`https://www.youtube.com/embed/${aulaAtual?.youtube_id}?rel=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="player-aula-info">
              <span className="aula-dur" style={{ marginRight: '1rem' }}>{aulaAtual?.duracao}</span>
              <span className="player-aula-desc">{aulaAtual?.descricao}</span>
              <button
                className="player-concluir"
                style={concluidas.has(aulaAtual?.id ?? '') ? { color: '#10B981', borderColor: '#10B98140' } : { color: cor, borderColor: `${cor}40` }}
                onClick={() => aulaAtual && marcarConcluida(aulaAtual.id)}
                disabled={concluidas.has(aulaAtual?.id ?? '')}
              >
                {concluidas.has(aulaAtual?.id ?? '') ? '✓ Concluída' : 'Marcar como concluída'}
              </button>
            </div>
          </>
        ) : (
          /* Quiz */
          <div className="player-quiz">
            <p className="quiz-title" style={{ marginBottom: '1.5rem' }}>
              {todasRespondidas
                ? `Resultado: ${acertos}/${quiz?.perguntas.length} corretas`
                : 'Responda todas as perguntas para continuar'}
            </p>
            {quiz?.perguntas.map((p, pi) => {
              const resposta = respostas[p.id]
              const respondida = resposta !== undefined
              return (
                <div key={p.id} className="quiz-pergunta">
                  <p className="quiz-enunciado">{pi + 1}. {p.enunciado}</p>
                  <div className="quiz-opcoes">
                    {p.alternativas.map((alt, idx) => {
                      let cls = 'quiz-opcao'
                      if (respondida) {
                        if (idx === p.correta) cls += ' correta'
                        else if (idx === resposta) cls += ' errada'
                      }
                      return (
                        <button key={idx} className={cls} onClick={() => responder(p.id, idx)} disabled={respondida}>
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
            {todasRespondidas && idxGlobal < total - 1 && (
              <button className="player-continuar" style={{ background: cor }} onClick={proximo}>
                Próxima aula →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside className="player-sidebar">
        <div className="sidebar-progresso">
          <div className="sidebar-progresso-label">
            <span>Progresso</span>
            <span style={{ color: cor }}>{progresso}%</span>
          </div>
          <div className="sidebar-progresso-bar">
            <div className="sidebar-progresso-fill" style={{ width: `${progresso}%`, background: cor }} />
          </div>
          <p className="sidebar-progresso-sub">{concluidas.size}/{total} aulas concluídas</p>
        </div>

        <p className="sidebar-titulo">Capítulos</p>

        {trilhas.map((trilha, ti) => {
          const aberto = capituloAberto === ti
          const aulasConcluidas = trilha.aulas.filter(a => concluidas.has(a.id)).length
          return (
            <div key={trilha.id} className="sidebar-capitulo">
              <button
                className={`sidebar-cap-header ${aberto ? 'aberto' : ''}`}
                onClick={() => setCapituloAberto(aberto ? -1 : ti)}
              >
                <span className="sidebar-cap-icon">{aberto ? '∨' : '›'}</span>
                <span className="sidebar-cap-nome">{trilha.titulo}</span>
                <span className="sidebar-cap-count">
                  {aulasConcluidas}/{trilha.aulas.length}
                </span>
              </button>

              {aberto && (
                <div className="sidebar-cap-aulas">
                  {trilha.aulas.map((aula, ai) => {
                    const ativo = aulaAtual?.id === aula.id && !mostraQuiz
                    const feita = concluidas.has(aula.id)
                    return (
                      <button
                        key={aula.id}
                        className={`sidebar-aula ${ativo ? 'ativo' : ''}`}
                        style={ativo ? { borderLeft: `2px solid ${cor}`, color: cor } : {}}
                        onClick={() => irPara({ ...aula, capituloIdx: ti, aulaIdx: ai, capituloTitulo: trilha.titulo })}
                      >
                        <span className="sidebar-aula-icon" style={feita ? { color: '#10B981' } : {}}>
                          {feita ? '✓' : '▶'}
                        </span>
                        <span className="sidebar-aula-nome">{aula.titulo}</span>
                        <span className="sidebar-aula-dur">{aula.duracao}</span>
                      </button>
                    )
                  })}
                  <button
                    className={`sidebar-aula sidebar-quiz ${mostraQuiz && aulaAtual?.capituloIdx === ti ? 'ativo' : ''}`}
                    style={mostraQuiz && aulaAtual?.capituloIdx === ti ? { borderLeft: `2px solid ${cor}`, color: cor } : {}}
                    onClick={() => {
                      setAulaAtual({ ...trilha.aulas[0], capituloIdx: ti, aulaIdx: 0, capituloTitulo: trilha.titulo })
                      setMostraQuiz(true)
                      setRespostas({})
                    }}
                  >
                    <span className="sidebar-aula-icon">?</span>
                    <span className="sidebar-aula-nome">Quiz</span>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </aside>
    </div>
  )
}