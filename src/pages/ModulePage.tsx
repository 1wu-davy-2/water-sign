import { useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { Highlight } from '../components/Highlight'
import { Markdown } from '../components/Markdown'
import { Sidebar } from '../components/Sidebar'
import { TemplateBrowser } from '../components/TemplateBrowser'
import { getModule, modulesByOrder } from '../data/modules'
import { ZODIAC_META } from '../data/types'

export function ModulePage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()

  const module = getModule(id)
  const sectionParam = searchParams.get('s')
  const query = searchParams.get('q') ?? ''

  // 从搜索结果跳进来时（?s=小节id），滚到对应小节
  useEffect(() => {
    if (!sectionParam) return
    const raf = requestAnimationFrame(() => {
      document.getElementById(sectionParam)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => cancelAnimationFrame(raf)
  }, [sectionParam, module?.id])

  if (!module) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-sm text-foam-400">找不到这个模块。</p>
        <Link to="/" className="mt-4 inline-block text-sm text-tide-300 hover:underline">
          ← 返回首页
        </Link>
      </div>
    )
  }

  const index = modulesByOrder.findIndex((m) => m.id === module.id)
  const previous = index > 0 ? modulesByOrder[index - 1] : undefined
  const next = index < modulesByOrder.length - 1 ? modulesByOrder[index + 1] : undefined

  return (
    <div className="flex gap-10">
      <Sidebar module={module} />

      <article className="min-w-0 flex-1">
        <header className="mb-8 border-b border-abyss-800 pb-6">
          <div className="flex items-center gap-2 text-xs text-foam-500">
            <Link to="/" className="transition hover:text-tide-300">
              首页
            </Link>
            <span aria-hidden="true">/</span>
            <span>模块 {module.order}</span>
          </div>

          <h1 className="mt-3 flex items-start gap-3 text-2xl font-bold tracking-tight text-foam-100 sm:text-3xl">
            <span aria-hidden="true" className="mt-0.5 text-xl text-tide-400">
              {module.symbol}
            </span>
            {module.title}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-foam-400">{module.description}</p>
        </header>

        <div className="flex flex-col gap-12">
          {module.sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="text-lg font-semibold tracking-tight text-foam-100">
                <Highlight text={section.title} query={query} />
              </h2>

              {section.zodiac && section.zodiac.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {section.zodiac.map((scope) => (
                    <span
                      key={scope}
                      title={ZODIAC_META[scope].trait}
                      className="rounded-full border border-abyss-600 px-2 py-0.5 text-[0.7rem] text-foam-400"
                    >
                      {ZODIAC_META[scope].symbol} {ZODIAC_META[scope].label}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <Markdown>{section.content}</Markdown>
              </div>

              {section.relatedTemplates && section.relatedTemplates.length > 0 && (
                <div className="mt-6 rounded-2xl border border-abyss-700 bg-abyss-900/50 p-4 sm:p-5">
                  <TemplateBrowser
                    scenes={section.relatedTemplates}
                    showFilters={section.relatedTemplates.length > 3}
                    // 星座专属模块只内联该星座适用的话术，
                    // 否则「巨蟹座专属」页里会混进天蝎和双鱼专属的卡片
                    lockZodiac={module.sign}
                    limit={4}
                  />
                </div>
              )}
            </section>
          ))}
        </div>

        <nav className="mt-14 flex flex-col gap-3 border-t border-abyss-800 pt-6 sm:flex-row sm:justify-between">
          {previous ? (
            <Link
              to={`/module/${previous.id}`}
              className="group flex flex-col rounded-xl border border-abyss-700 px-4 py-3 transition hover:border-tide-500/50"
            >
              <span className="text-xs text-foam-500">← 上一模块</span>
              <span className="mt-0.5 text-sm text-foam-200 group-hover:text-tide-300">
                {previous.shortTitle}
              </span>
            </Link>
          ) : (
            <span />
          )}

          {next && (
            <Link
              to={`/module/${next.id}`}
              className="group flex flex-col rounded-xl border border-abyss-700 px-4 py-3 transition hover:border-tide-500/50 sm:items-end"
            >
              <span className="text-xs text-foam-500">下一模块 →</span>
              <span className="mt-0.5 text-sm text-foam-200 group-hover:text-tide-300">
                {next.shortTitle}
              </span>
            </Link>
          )}
        </nav>
      </article>
    </div>
  )
}
