import { Link, useSearchParams } from 'react-router'
import { SearchBar } from '../components/SearchBar'
import { TemplateBrowser, isZodiacFilter } from '../components/TemplateBrowser'
import { ZODIAC_META } from '../data/types'
import { speechTemplates } from '../data/speech-templates'

export function TemplatesPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''

  // 从星座模块的「还有 N 条 →」跳进来时带上 sign，预选对应星座。
  // 校验后再用，避免 URL 里塞进任意值把筛选器搞成空状态。
  const signParam = searchParams.get('sign')
  const initialZodiac = isZodiacFilter(signParam) ? signParam : undefined

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
        {initialZodiac && initialZodiac !== 'any' && (
          <p className="text-xs text-foam-500">
            已预选「{ZODIAC_META[initialZodiac].label}」 ·{' '}
            <Link to="/templates" className="text-tide-300 hover:underline">
              查看全部
            </Link>
          </p>
        )}
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

      {/* key 让 ?sign= 变化时重建组件 —— useState 的初值只在挂载时读一次 */}
      <TemplateBrowser
        key={initialZodiac ?? 'any'}
        query={query}
        initialZodiac={initialZodiac}
      />
    </div>
  )
}
