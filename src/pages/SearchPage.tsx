import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Highlight } from '../components/Highlight'
import { SearchBar } from '../components/SearchBar'
import { TemplateCard } from '../components/TemplateCard'
import { searchSections, searchTemplates } from '../lib/search'

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''

  const sections = useMemo(() => searchSections(query), [query])
  const templates = useMemo(() => searchTemplates(query), [query])

  const total = sections.length + templates.length

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold tracking-tight text-foam-100">搜索</h1>
        {/* key 让 URL 里的 q 变化时重建输入框，保持输入框与结果一致 */}
        <SearchBar key={query} initialValue={query} autoFocus={query.length === 0} />
      </div>

      {query.length === 0 ? (
        <p className="py-10 text-center text-sm text-foam-500">输入关键词开始检索。</p>
      ) : total === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-foam-400">没有找到「{query}」相关的内容。</p>
          <p className="mt-2 text-xs text-foam-500">
            试试更短的关键词，例如「冷淡」「表白」「安全感」「雷区」。
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-foam-500">
            共 {total} 条结果 · 正文 {sections.length} · 话术 {templates.length}
          </p>

          {sections.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold tracking-widest text-foam-500 uppercase">正文</h2>
              <ul className="flex flex-col gap-2">
                {sections.map((hit) => (
                  <li key={`${hit.moduleId}-${hit.sectionId}`}>
                    <Link
                      to={`/module/${hit.moduleId}?s=${hit.sectionId}&q=${encodeURIComponent(query)}`}
                      className="surface group block rounded-xl p-4 transition hover:border-tide-500/50 hover:bg-abyss-850"
                    >
                      <span className="block text-sm font-medium text-foam-100 group-hover:text-tide-300">
                        <Highlight text={hit.sectionTitle} query={query} />
                      </span>
                      <span className="mt-1 block text-xs text-foam-500">
                        <Highlight text={hit.moduleTitle} query={query} />
                      </span>
                      <span className="mt-2 block text-sm leading-relaxed text-foam-400">
                        <Highlight text={hit.snippet} query={query} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {templates.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold tracking-widest text-foam-500 uppercase">话术</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {templates.map((tpl) => (
                  <TemplateCard key={tpl.id} template={tpl} query={query} showScene />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
