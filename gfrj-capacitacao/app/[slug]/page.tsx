import Link from 'next/link'
import { notFound } from 'next/navigation'
import subsistemas from '../../data/subsistemas.json'
import type { Subsistema } from '../../lib/types'
import CoursePlayer from '../../components/AulaPlayer'

export function generateStaticParams() {
  return (subsistemas as Subsistema[]).map(s => ({ slug: s.slug }))
}

export default async function SubsistemaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const sub = (subsistemas as Subsistema[]).find(s => s.slug === slug)
  if (!sub) notFound()

  return (
    <>
      <nav className="nav">
        <span className="nav-logo">GF<span>RJ</span></span>
        <Link href="/" className="nav-link">← Subsistemas</Link>
      </nav>
      <CoursePlayer trilhas={sub.trilhas} cor={sub.cor} nome={sub.nome} slug={sub.slug} />
    </>
  )
}