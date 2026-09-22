import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { SCENE_META } from '../data/types'
import { searchSections, searchTemplates } from '../lib/search'

interface SearchBarProps {
  autoFocus?: boolean
  /** 在移动端抽屉里使用时，跳转后需要顺手关掉抽屉。 */
  onNavigate?: () => void
  placeholder?: string
  /** 初始值。只在挂载时生效——需要跟随 URL 变化时请配合 `key` 使用。 */
  initialValue?: string
}

/**
 * 搜索框 + 实时下拉建议。
 *
 * 数据量只有几十 KB，每次输入直接同步重算即可（`useMemo` 缓存），
 * 不需要防抖——防抖反而会让输入感觉迟钝。
 */
export function SearchBar({
  autoFocus = false,
  onNavigate,
  placeholder = '搜索：冷淡、表白、安全感…',
  initialValue = '',
}: SearchBarProps) {
  const navigate = useNavigate()
  const [value, setValue] = useState(initialValue)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const query = value.trim()

  const { sections, templates } = useMemo(() => {
    if (query.length === 0) return { sections: [], templates: [] }
    return {
      sections: searchSections(query).slice(0, 5),
      templates: searchTemplates(query).slice(0, 4),
    }
  }, [query])

  const hasResults = sections.length > 0 || templates.length > 0

  // 点击外部关闭下拉
  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  // 全局快捷键：按 / 聚焦搜索框
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey) return
      const target = event.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return
      event.preventDefault()
      inputRef.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  function goToSearch() {
    if (query.length === 0) return
    setOpen(false)
    onNavigate?.()
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  function goToSection(moduleId: string, sectionId: string) {
    setOpen(false)
    onNavigate?.()
    navigate(`/module/${moduleId}?s=${sectionId}&q=${encodeURIComponent(query)}`)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <SearchIcon />
        <input
          ref={inputRef}
          type="search"
          value={value}
          autoFocus={autoFocus}
          placeholder={placeholder}
          aria-label="搜索内容"
          onChange={(event) => {
            setValue(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') goToSearch()
            if (event.key === 'Escape') {
              setOpen(false)
              inputRef.current?.blur()
            }
          }}
          className="w-full rounded-xl border border-abyss-600 bg-abyss-900/80 py-2 pr-3 pl-9 text-sm text-foam-200 placeholder:text-foam-500 transition focus:border-tide-500 focus:bg-abyss-900 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border border-abyss-600 px-1.5 py-0.5 text-[0.65rem] text-foam-500 sm:block">
          /
        </kbd>
      </div>

      {open && query.length > 0 && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-abyss-600 bg-abyss-900/97 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {!hasResults && <p className="px-3 py-4 text-sm text-foam-500">没有找到「{query}」相关的内容。</p>}

          {sections.length > 0 && (
            <>
              <p className="px-3 pt-2 pb-1 text-[0.7rem] font-semibold tracking-wider text-foam-500 uppercase">
                正文
              </p>
              <ul>
                {sections.map((hit) => (
                  <li key={`${hit.moduleId}-${hit.sectionId}`}>
                    <button
                      type="button"
                      onClick={() => goToSection(hit.moduleId, hit.sectionId)}
                      className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-abyss-800"
                    >
                      <span className="block truncate text-sm text-foam-200">{hit.sectionTitle}</span>
                      <span className="mt-0.5 block truncate text-xs text-foam-500">{hit.snippet}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {templates.length > 0 && (
            <>
              <p className="px-3 pt-3 pb-1 text-[0.7rem] font-semibold tracking-wider text-foam-500 uppercase">
                话术
              </p>
              <ul>
                {templates.map((tpl) => (
                  <li key={tpl.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false)
                        onNavigate?.()
                        navigate(`/templates?q=${encodeURIComponent(query)}`)
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-abyss-800"
                    >
                      <span className="block truncate text-sm text-foam-200">{tpl.text}</span>
                      <span className="mt-0.5 block text-xs text-foam-500">{SCENE_META[tpl.scene].label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {hasResults && (
            <button
              type="button"
              onClick={goToSearch}
              className="mt-1 w-full rounded-lg border-t border-abyss-700 px-3 py-2 text-center text-xs text-tide-300 transition hover:bg-abyss-800"
            >
              查看全部结果 →
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-foam-500"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  )
}
