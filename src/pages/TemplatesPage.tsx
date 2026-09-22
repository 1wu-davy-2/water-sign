import { Link, useSearchParams } from 'react-router'
import { SearchBar } from '../components/SearchBar'
import { TemplateBrowser } from '../components/TemplateBrowser'
import { speechTemplates } from '../data/speech-templates'

export function TemplatesPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-foam-100">话术库</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-foam-400">
          {speechTemplates.length} 条可直接复制的话术，按场景与星座筛选。
          点卡片右上角复制，点星标收藏（只存在本机浏览器）。
        </p>
        <div className="max-w-xl">
          <SearchBar key={query} initialValue={query} />
        </div>
        {query.length > 0 && (
          <p className="text-xs text-foam-500">
            当前展示全部话术，命中「{query}」的会高亮 ·{' '}
            {/* 必须用 Link：裸 <a> 会触发整页刷新，重新下载 bundle 并丢掉 SPA 状态 */}
            <Link to="/templates" className="text-tide-300 hover:underline">
              清除
            </Link>
          </p>
        )}
      </header>

      {/* 给 TemplateBrowser 内部按场景分组的 h3 补一个上级 h2，避免 h1 → h3 跳级 */}
      <h2 className="sr-only">全部话术</h2>

      <TemplateBrowser query={query} />
    </div>
  )
}
