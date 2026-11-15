export type Tone = "peach" | "lilac" | "mint" | "sky" | "butter" | "rose"

export type CategoryId = "work" | "dev" | "design" | "learn" | "social" | "finance" | "media"

export type Category = { id: CategoryId; label: string; tone: Tone }

export type LinkItem = {
  id: string
  title: string
  url: string
  category: CategoryId
  description?: string
  clicks: number
  lastOpened?: number
}

export type Routine = {
  id: string
  name: string
  description: string
  /** Hours [start, end) when this routine is suggested. */
  hours: [number, number]
  linkIds: string[]
}

export type ReadLaterItem = { id: string; title: string; url: string; done: boolean }

export type HubData = {
  links: LinkItem[]
  pinnedOrder: string[]
  routines: Routine[]
  readLater: ReadLaterItem[]
  notes: string
  /** Opens per day for the last 7 days, oldest first. */
  activity: number[]
}

export const categories: Category[] = [
  { id: "work", label: "Trabalho", tone: "peach" },
  { id: "dev", label: "Dev", tone: "mint" },
  { id: "design", label: "Design", tone: "lilac" },
  { id: "learn", label: "Estudos", tone: "sky" },
  { id: "finance", label: "Finanças", tone: "butter" },
  { id: "social", label: "Social", tone: "rose" },
  { id: "media", label: "Mídia", tone: "peach" },
]

export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c])) as Record<
  CategoryId,
  Category
>

const links: LinkItem[] = [
  { id: "gmail", title: "Gmail", url: "https://mail.google.com", category: "work", description: "Inbox pessoal", clicks: 214 },
  { id: "calendar", title: "Calendar", url: "https://calendar.google.com", category: "work", description: "Agenda da semana", clicks: 148 },
  { id: "notion", title: "Notion", url: "https://www.notion.so", category: "work", description: "Docs e wiki", clicks: 131 },
  { id: "slack", title: "Slack", url: "https://app.slack.com", category: "work", description: "Chat do time", clicks: 189 },
  { id: "linear", title: "Linear", url: "https://linear.app", category: "work", description: "Issues e sprints", clicks: 97 },
  { id: "github", title: "GitHub", url: "https://github.com", category: "dev", description: "Repos e PRs", clicks: 256 },
  { id: "vercel", title: "Vercel", url: "https://vercel.com/dashboard", category: "dev", description: "Deploys", clicks: 88 },
  { id: "nextdocs", title: "Next.js Docs", url: "https://nextjs.org/docs", category: "dev", description: "Referência do framework", clicks: 73 },
  { id: "mdn", title: "MDN", url: "https://developer.mozilla.org", category: "dev", description: "Web APIs", clicks: 41 },
  { id: "claude", title: "Claude", url: "https://claude.ai", category: "dev", description: "Pair programming", clicks: 302 },
  { id: "figma", title: "Figma", url: "https://www.figma.com", category: "design", description: "Arquivos de design", clicks: 112 },
  { id: "dribbble", title: "Dribbble", url: "https://dribbble.com", category: "design", description: "Inspiração", clicks: 36 },
  { id: "phosphor", title: "Phosphor Icons", url: "https://phosphoricons.com", category: "design", description: "Biblioteca de ícones", clicks: 22 },
  { id: "coolors", title: "Coolors", url: "https://coolors.co", category: "design", description: "Paletas de cor", clicks: 14 },
  { id: "youtube", title: "YouTube", url: "https://www.youtube.com", category: "media", description: "Vídeos e talks", clicks: 167 },
  { id: "spotify", title: "Spotify", url: "https://open.spotify.com", category: "media", description: "Foco com música", clicks: 120 },
  { id: "coursera", title: "Coursera", url: "https://www.coursera.org", category: "learn", description: "Cursos em andamento", clicks: 19 },
  { id: "duolingo", title: "Duolingo", url: "https://www.duolingo.com", category: "learn", description: "Streak diário", clicks: 64 },
  { id: "nubank", title: "Nubank", url: "https://nubank.com.br", category: "finance", description: "Conta e cartão", clicks: 45 },
  { id: "investing", title: "Investing", url: "https://br.investing.com", category: "finance", description: "Mercado", clicks: 18 },
  { id: "linkedin", title: "LinkedIn", url: "https://www.linkedin.com", category: "social", description: "Rede profissional", clicks: 52 },
  { id: "x", title: "X", url: "https://x.com", category: "social", description: "Timeline", clicks: 77 },
]

export const initialData: HubData = {
  links,
  pinnedOrder: ["claude", "github", "gmail", "calendar", "notion", "figma", "vercel", "spotify"],
  routines: [
    {
      id: "morning",
      name: "Começo do dia",
      description: "Inbox, agenda e tarefas",
      hours: [5, 11],
      linkIds: ["gmail", "calendar", "linear", "slack"],
    },
    {
      id: "deep-work",
      name: "Deep work",
      description: "Código, IA e trilha sonora",
      hours: [11, 18],
      linkIds: ["github", "claude", "vercel", "spotify"],
    },
    {
      id: "design-review",
      name: "Design review",
      description: "Arquivos e referências",
      hours: [14, 17],
      linkIds: ["figma", "dribbble", "coolors"],
    },
    {
      id: "wind-down",
      name: "Fim do dia",
      description: "Estudos e lazer",
      hours: [18, 24],
      linkIds: ["duolingo", "coursera", "youtube"],
    },
  ],
  readLater: [
    { id: "rl1", title: "Building calm interfaces", url: "https://calm.tech", done: false },
    { id: "rl2", title: "React Compiler deep dive", url: "https://react.dev/learn/react-compiler", done: false },
    { id: "rl3", title: "Motion layout animations", url: "https://motion.dev/docs/react-layout-animations", done: true },
  ],
  notes: "• Revisar PR do dashboard\n• Pagar fatura até sexta\n• Ideia: atalho p/ abrir rotina da manhã",
  activity: [32, 45, 38, 51, 62, 28, 41],
}
