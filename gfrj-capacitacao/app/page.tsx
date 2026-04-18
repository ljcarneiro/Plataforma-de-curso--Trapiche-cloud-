import Link from 'next/link'
import subsistemas from '../data/subsistemas.json'
import type { Subsistema } from '../lib/types.ts'

export default function Home() {
  const data = subsistemas as Subsistema[]

  return (
    <>
      <nav className="nav">
        <span className="nav-logo">GF<span>RJ</span></span>
        <Link href="/" className="nav-link">Capacitação Técnica</Link>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-tag">Grupo de Foguetes Rio de Janeiro</div>
          <h1>Aprenda.<br /><em>Construa.</em> Voe.</h1>
          <p>
            Trilhas de capacitação técnica para membros da equipe e para a comunidade.
            Escolha um subsistema e comece agora.
          </p>
        </section>

        <section className="section">
          <p className="section-title">Subsistemas técnicos</p>
          <div className="grid">
            {data.map((sub) => {
              const totalAulas = sub.trilhas.reduce((acc, t) => acc + t.aulas.length, 0)
              const primeiroVideo = sub.trilhas[0]?.aulas[0]?.youtube_id
              const thumb = primeiroVideo && !primeiroVideo.startsWith('SUBSTITUA')
                ? `https://img.youtube.com/vi/${primeiroVideo}/mqdefault.jpg`
                : null

              return (
                <Link href={`/${sub.slug}`} key={sub.slug} className="card">
                  <div className="card-thumb" style={{ background: `${sub.cor}15`, border: `1px solid ${sub.cor}25` }}>
                    <div className="card-thumb-placeholder">{sub.icone}</div>
                  </div>
                  <h2 className="card-title">{sub.nome}</h2>
                  <p className="card-desc">{sub.descricao}</p>
                  <div className="card-meta">
                    <span className="card-count">
                      {sub.trilhas.length} trilha{sub.trilhas.length !== 1 ? 's' : ''} · {totalAulas} aula{totalAulas !== 1 ? 's' : ''}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="card-dot" style={{ background: sub.cor }} />
                      <span className="card-arrow">→</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </main>
    </>
  )
}