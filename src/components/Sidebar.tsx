import { useMemo } from 'react'
import { NavLink } from 'react-router'
import { modulesByOrder } from '../data/modules'
import type { Module } from '../data/types'
import { useFavorites } from '../lib/favorites'
import { useActiveSection } from '../lib/useActiveSection'

interface SidebarProps {
  /** 当前模块；在模块页传入，用于渲染小节目录。 */
  module?: Module
}

/** 桌面端左侧栏：模块导航 + 当前模块的小节目录（滚动联动）。 */
export function Sidebar({ module }: SidebarProps) {
  const { count } = useFavorites()

  const sectionIds = useMemo(() => module?.sections.map((s) => s.id) ?? [], [module])
  const activeSection = useActiveSection(sectionIds)

  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-24 flex max-h-[calc(100vh-8rem)] flex-col gap-6 overflow-y-auto pr-1 pb-6">
        <nav aria-label="模块导航">
          {/* 用 <p> 而不是 <h2>：侧栏在 DOM 里排在页面 <h1> 之前，
              用标题会让文档大纲变成 h2 → h1。nav 自身有 aria-label 提供可访问名。 */}
          <p className="mb-2 px-3 text-[0.7rem] font-semibold tracking-widest text-foam-500 uppercase">
            模块
          </p>
          <ul className="flex flex-col gap-0.5">
            {modulesByOrder.map((m) => (
              <li key={m.id}>
                <NavLink
                  to={`/module/${m.id}`}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition',
                      isActive
                        ? 'bg-tide-500/15 font-medium text-tide-300'
                        : 'text-foam-400 hover:bg-abyss-800/60 hover:text-foam-200',
                    ].join(' ')
                  }
                >
                  <span aria-hidden="true" className="text-xs opacity-70">
                    {m.symbol}
                  </span>
                  <span className="truncate">{m.shortTitle}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {module && (
          <nav aria-label="本节目录">
            <p className="mb-2 px-3 text-[0.7rem] font-semibold tracking-widest text-foam-500 uppercase">
              本节目录
            </p>
            <ul className="flex flex-col gap-0.5 border-l border-abyss-700">
              {module.sections.map((s) => {
                const isActive = activeSection === s.id
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      aria-current={isActive ? 'location' : undefined}
                      className={[
                        '-ml-px block border-l-2 py-1.5 pl-3 text-[0.8rem] leading-snug transition',
                        isActive
                          ? 'border-tide-400 font-medium text-tide-300'
                          : 'border-transparent text-foam-500 hover:border-abyss-600 hover:text-foam-300',
                      ].join(' ')}
                    >
                      {s.title}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
        )}

        <nav aria-label="其他">
          <ul className="flex flex-col gap-0.5">
            <li>
              <NavLink
                to="/templates"
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition',
                    isActive
                      ? 'bg-tide-500/15 font-medium text-tide-300'
                      : 'text-foam-400 hover:bg-abyss-800/60 hover:text-foam-200',
                  ].join(' ')
                }
              >
                <span aria-hidden="true" className="text-xs opacity-70">
                  ❋
                </span>
                话术库
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/favorites"
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition',
                    isActive
                      ? 'bg-tide-500/15 font-medium text-tide-300'
                      : 'text-foam-400 hover:bg-abyss-800/60 hover:text-foam-200',
                  ].join(' ')
                }
              >
                <span aria-hidden="true" className="text-xs opacity-70">
                  ★
                </span>
                <span>我的收藏</span>
                {count > 0 && (
                  <span className="ml-auto rounded-full bg-abyss-700 px-1.5 py-0.5 text-[0.65rem] text-foam-300">
                    {count}
                  </span>
                )}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  )
}
