import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { SCENE_META, ZODIAC_META } from '../data/types'
import type { Scene, SpeechTemplate, ZodiacScope } from '../data/types'
import { SCENE_ORDER, speechTemplates } from '../data/speech-templates'
import { TemplateCard } from './TemplateCard'

interface TemplateBrowserProps {
  /** 只展示这些场景；省略表示全部。 */
  scenes?: Scene[]
  /** 外部传入的检索词（搜索结果页高亮用）。 */
  query?: string
  /** 是否显示筛选器。 */
  showFilters?: boolean
  /** 是否按场景分组展示。 */
  groupByScene?: boolean
  /** 无结果时的提示文案。 */
  emptyHint?: string
}

/**
 * 星座筛选有「不筛选」和「只看通用」两种不同的诉求，必须分开：
 * 若把默认值直接设成 `'all'`（= 通用），所有带具体星座标签的话术
 * 会在默认状态下被静默隐藏，用户根本不知道有内容没显示出来。
 */
type ZodiacFilter = 'any' | ZodiacScope

const ZODIAC_FILTERS: ZodiacFilter[] = ['any', 'all', 'cancer', 'scorpio', 'pisces']

const ZODIAC_FILTER_LABEL: Record<ZodiacFilter, string> = {
  // 不叫「全部」：场景行已经有一个「全部」了，两行同名会让人分不清在筛什么
  any: '不限',
  all: '通用',
  cancer: '巨蟹座',
  scorpio: '天蝎座',
  pisces: '双鱼座',
}

/**
 * 话术浏览器：场景筛选 + 星座筛选 + 分组展示。
 *
 * 星座筛选的语义是「**这条话术对某星座是否适用**」，因此筛「巨蟹」时
 * 通用话术也会出现（排在专属话术之后），否则用户会以为内容缺失。
 */
export function TemplateBrowser({
  scenes,
  query = '',
  showFilters = true,
  groupByScene = true,
  emptyHint = '没有匹配的话术，试试换个筛选条件。',
}: TemplateBrowserProps) {
  const [scene, setScene] = useState<Scene | 'all'>('all')
  const [zodiac, setZodiac] = useState<ZodiacFilter>('any')

  const availableScenes = useMemo(
    () => (scenes ? SCENE_ORDER.filter((s) => scenes.includes(s)) : SCENE_ORDER),
    [scenes],
  )

  const visible = useMemo(() => {
    const filtered = speechTemplates.filter((tpl) => {
      if (!availableScenes.includes(tpl.scene)) return false
      if (scene !== 'all' && tpl.scene !== scene) return false
      if (zodiac === 'any') return true
      if (zodiac === 'all') return tpl.zodiac.includes('all')
      return tpl.zodiac.includes(zodiac) || tpl.zodiac.includes('all')
    })

    if (zodiac === 'any' || zodiac === 'all') return filtered

    // 星座专属的排在通用之前
    return [...filtered].sort((a, b) => {
      const rank = (tpl: SpeechTemplate) => (tpl.zodiac.includes(zodiac) ? 0 : 1)
      return rank(a) - rank(b)
    })
  }, [availableScenes, scene, zodiac])

  const grouped = useMemo(() => {
    const map = new Map<Scene, SpeechTemplate[]>()
    for (const tpl of visible) {
      const bucket = map.get(tpl.scene)
      if (bucket) bucket.push(tpl)
      else map.set(tpl.scene, [tpl])
    }
    return availableScenes
      .filter((s) => map.has(s))
      .map((s) => ({ scene: s, items: map.get(s) ?? [] }))
  }, [visible, availableScenes])

  return (
    <div className="flex flex-col gap-5">
      {showFilters && (
        <div className="flex flex-col gap-3">
          <FilterRow label="场景">
            <Chip active={scene === 'all'} onClick={() => setScene('all')}>
              全部
            </Chip>
            {availableScenes.map((s) => (
              <Chip key={s} active={scene === s} onClick={() => setScene(s)} title={SCENE_META[s].hint}>
                {SCENE_META[s].label}
              </Chip>
            ))}
          </FilterRow>

          <FilterRow label="星座">
            {ZODIAC_FILTERS.map((z) => (
              <Chip
                key={z}
                active={zodiac === z}
                onClick={() => setZodiac(z)}
                title={z === 'any' ? '不做星座筛选' : ZODIAC_META[z].trait}
              >
                {z !== 'any' && <span aria-hidden="true">{ZODIAC_META[z].symbol}</span>}{' '}
                {ZODIAC_FILTER_LABEL[z]}
              </Chip>
            ))}
          </FilterRow>
        </div>
      )}

      {/* aria-live：筛选后条数变化需要被读屏播报，否则用户不知道结果变了 */}
      <p aria-live="polite" className="text-xs text-foam-500">
        共 {visible.length} 条
        {zodiac !== 'any' && zodiac !== 'all' && ' · 专属话术优先，通用话术随后'}
      </p>

      {visible.length === 0 && <p className="py-8 text-center text-sm text-foam-500">{emptyHint}</p>}

      {groupByScene
        ? grouped.map(({ scene: s, items }) => (
            <section key={s} className="flex flex-col gap-3">
              <h3 className="flex items-baseline gap-2 text-sm font-semibold text-foam-100">
                {SCENE_META[s].label}
                <span className="text-xs font-normal text-foam-500">{SCENE_META[s].hint}</span>
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((tpl) => (
                  <TemplateCard key={tpl.id} template={tpl} query={query} />
                ))}
              </div>
            </section>
          ))
        : (
          <div className="grid gap-3 sm:grid-cols-2">
            {visible.map((tpl) => (
              <TemplateCard key={tpl.id} template={tpl} query={query} showScene />
            ))}
          </div>
        )}
    </div>
  )
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={`${label}筛选`} className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs font-medium text-foam-500">{label}</span>
      {children}
    </div>
  )
}

interface ChipProps {
  active: boolean
  onClick: () => void
  children: ReactNode
  title?: string
}

function Chip({ active, onClick, children, title }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={[
        'rounded-full border px-3 py-1 text-xs transition',
        active
          ? 'border-tide-500 bg-tide-500/20 font-medium text-tide-300'
          : 'border-abyss-600 text-foam-400 hover:border-tide-500/60 hover:text-foam-200',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
