import { Link } from 'react-router'
import { ZODIAC_META } from '../data/types'
import type { Module } from '../data/types'

/** 首页的模块入口卡片。 */
export function ContentCard({ module }: { module: Module }) {
  return (
    <Link
      to={`/module/${module.id}`}
      className={[
        'group surface relative flex flex-col gap-3 overflow-hidden rounded-2xl p-5',
        'transition duration-300 hover:-translate-y-0.5 hover:border-tide-500/50 hover:shadow-xl hover:shadow-tide-600/10',
      ].join(' ')}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${module.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />

      <div className="relative flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-abyss-600 bg-abyss-850 text-base text-tide-300"
        >
          {module.symbol}
        </span>
        {/* 星座专属模块显示该座的核心驱动，比「模块 6」更有信息量 */}
        <span className="text-[0.7rem] font-medium tracking-widest text-foam-500 uppercase">
          {module.sign ? ZODIAC_META[module.sign].trait : `模块 ${module.order}`}
        </span>
      </div>

      <div className="relative">
        <h3 className="text-base font-semibold text-foam-100 transition group-hover:text-tide-300">
          {module.shortTitle}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-foam-400">{module.description}</p>
      </div>

      <div className="relative mt-auto flex items-center justify-between pt-2 text-xs text-foam-500">
        <span>{module.sections.length} 个小节</span>
        <span className="text-tide-400 transition group-hover:translate-x-0.5">阅读 →</span>
      </div>
    </Link>
  )
}
