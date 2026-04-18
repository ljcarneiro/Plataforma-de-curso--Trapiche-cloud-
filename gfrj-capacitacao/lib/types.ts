export interface Pergunta {
  id: string
  enunciado: string
  alternativas: string[]
  correta: number
}

export interface Quiz {
  id: string
  perguntas: Pergunta[]
}

export interface Aula {
  id: string
  titulo: string
  descricao: string
  youtube_id: string
  duracao: string
}

export interface Trilha {
  id: string
  titulo: string
  descricao: string
  aulas: Aula[]
  quiz: Quiz
}

export interface Subsistema {
  slug: string
  nome: string
  descricao: string
  cor: string
  icone: string
  trilhas: Trilha[]
}