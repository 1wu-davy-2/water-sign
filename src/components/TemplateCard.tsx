import { useState } from 'react'
import { SCENE_META, ZODIAC_META } from '../data/types'
import type { SpeechTemplate } from '../data/types'
import { useFavorites } from '../lib/favorites'
import { useCopy } from '../lib/useCopy'
import { Highlight } from './Highlight'

interface TemplateCardProps {
  template: SpeechTemplate
  /** 当前检索词，用于高亮。 */
  query?: string
  /** 在话术库里按场景分组时不需要重复显示场景标签。 */
  showScene?: boolean
}

export function TemplateCard({ template, query = '', showScene = false }: TemplateCardProps) {
  const { copied, copy } = useCopy()
  const { isFavorite, toggle } = useFavorites()
  const [showWhy, setShowWhy] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)

  // copy() 失败时返回 false。以前直接忽略返回值，在剪贴板不可用的环境
  // （非 HTTPS、权限被拒）里点复制**毫无反应**，用户不知道发生了什么。
  async function handleCopy() {
    const ok = await copy(template.text)
    setCopyFailed(!ok)
  }

  const favorited = isFavorite(template.id)
  const scene = SCENE_META[template.scene]

  return (
    <article className="group surface flex flex-col gap-3 rounded-2xl p-4 transition duration-300 hover:border-tide-500/50 hover:bg-abyss-850">
      <div className="flex flex-wrap items-center gap-1.5">
        {showScene && (
          <span className="rounded-full bg-tide-500/15 px-2 py-0.5 text-[0.7rem] font-medium text-tide-300">
            {scene.label}
          </span>
        )}
        {template.zodiac.map((scope) => (
          <span
            key={scope}
            className="rounded-full border border-abyss-600 px-2 py-0.5 text-[0.7rem] text-foam-400"
            title={ZODIAC_META[scope].trait}
          >
            {ZODIAC_META[scope].symbol} {ZODIAC_META[scope].short}
          </span>
        ))}

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => void handleCopy()}
            aria-label={copied ? '已复制' : copyFailed ? '复制失败，请手动选择文本' : '复制这条话术'}
            title={copied ? '已复制' : copyFailed ? '复制失败，请手动选择文本' : '复制'}
            className={[
              'flex h-7 w-7 items-center justify-center rounded-lg border transition',
              copied
                ? 'border-mist-400/60 bg-mist-400/15 text-mist-300'
                : copyFailed
                  ? 'border-red-500/60 bg-red-500/10 text-red-300'
                  : 'border-abyss-600 text-foam-400 hover:border-tide-500 hover:text-tide-300',
            ].join(' ')}
          >
            {copied ? <CheckIcon /> : copyFailed ? <AlertIcon /> : <CopyIcon />}
          </button>

          <button
            type="button"
            onClick={() => toggle(template.id)}
            aria-label={favorited ? '取消收藏' : '收藏这条话术'}
            aria-pressed={favorited}
            title={favorited ? '取消收藏' : '收藏'}
            className={[
              'flex h-7 w-7 items-center justify-center rounded-lg border transition',
              favorited
                ? 'border-lilac-400/60 bg-lilac-400/15 text-lilac-300'
                : 'border-abyss-600 text-foam-400 hover:border-lilac-400 hover:text-lilac-300',
            ].join(' ')}
          >
            <StarIcon filled={favorited} />
          </button>
        </div>
      </div>

      <p className="text-[0.95rem] leading-[1.85] text-foam-100">
        <Highlight text={template.text} query={query} />
      </p>

      <div className="mt-auto">
        {template.why && (
          <>
            <button
              type="button"
              onClick={() => setShowWhy((v) => !v)}
              aria-expanded={showWhy}
              className="flex items-center gap-1 text-[0.7rem] text-foam-500 transition hover:text-tide-300"
            >
              <ChevronIcon open={showWhy} />
              为什么有效
            </button>
            {showWhy && (
              <p className="mt-2 border-l border-abyss-600 pl-3 text-xs leading-relaxed text-foam-400">
                {template.why}
              </p>
            )}
          </>
        )}

        {template.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[0.7rem] text-foam-500">
            {template.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

/* ── 图标 ─────────────────────────────────────────────────── */

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" strokeLinecap="round" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
      <path d="M12 7.5v6" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5">
      <path d="M4 12.5 9 17.5 20 6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-3.5 w-3.5"
    >
      <path
        d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8z"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={['h-3 w-3 transition-transform', open ? 'rotate-90' : ''].join(' ')}
    >
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
