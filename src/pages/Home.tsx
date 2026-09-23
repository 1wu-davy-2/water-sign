import { Link } from 'react-router'
import { ContentCard } from '../components/ContentCard'
import { SearchBar } from '../components/SearchBar'
import { modulesByOrder } from '../data/modules'
import { speechTemplates } from '../data/speech-templates'
import { ZODIAC_META } from '../data/types'
import type { Zodiac } from '../data/types'

const SIGNS: Zodiac[] = ['cancer', 'scorpio', 'pisces']

export function Home() {
  const sectionCount = modulesByOrder.reduce((sum, m) => sum + m.sections.length, 0)

  // 通用心法（模块 1-5）与星座专属（模块 6+）分组展示
  const generalModules = modulesByOrder.filter((m) => !m.sign)
  const signModules = modulesByOrder.filter((m) => m.sign)

  return (
    <div className="flex flex-col gap-12">
      <section className="animate-rise flex flex-col items-center gap-6 py-6 text-center sm:py-10">
        <span className="rounded-full border border-abyss-600 bg-abyss-850/70 px-3 py-1 text-xs text-foam-400">
          巨蟹 · 天蝎 · 双鱼
        </span>

        <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-foam-100 sm:text-4xl lg:text-5xl">
          用水象听得懂的语言，
          <span className="bg-gradient-to-r from-tide-400 to-lilac-400 bg-clip-text text-transparent">
            把话说进心里
          </span>
        </h1>

        <p className="max-w-2xl text-sm leading-relaxed text-foam-400 sm:text-base">
          从认识水象的恋爱驱动，到聊天心法、暧昧节奏、恋爱经营与实战话术。
          {modulesByOrder.length} 个模块 · {sectionCount} 个小节 · {speechTemplates.length} 条可复制话术。
        </p>

        <div className="w-full max-w-xl">
          <SearchBar placeholder="试试搜「冷淡」「表白」「安全感」…" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {SIGNS.map((sign) => (
            <span
              key={sign}
              className="flex items-center gap-1.5 rounded-full border border-abyss-600 px-3 py-1 text-xs text-foam-400"
            >
              <span aria-hidden="true" className="text-tide-400">
                {ZODIAC_META[sign].symbol}
              </span>
              {ZODIAC_META[sign].label}
              <span className="text-foam-500">· {ZODIAC_META[sign].trait}</span>
            </span>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-foam-100">通用心法</h2>
          <span className="text-xs text-foam-500">建议按顺序阅读</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {generalModules.map((module) => (
            <ContentCard key={module.id} module={module} />
          ))}

          <Link
            to="/templates"
            className="group flex flex-col items-start justify-center gap-2 rounded-2xl border border-dashed border-abyss-600 bg-abyss-850/50 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-tide-500/50"
          >
            <span aria-hidden="true" className="text-base text-lilac-400">
              ❋
            </span>
            <h3 className="text-base font-semibold text-foam-100 transition group-hover:text-tide-300">
              话术库
            </h3>
            <p className="text-sm leading-relaxed text-foam-400">
              按场景与星座筛选 {speechTemplates.length} 条话术，一键复制或收藏。
            </p>
          </Link>
        </div>
      </section>

      {signModules.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-foam-100">按星座深入</h2>
            <span className="text-xs text-foam-500">挑你自己的星座看</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {signModules.map((module) => (
              <ContentCard key={module.id} module={module} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
