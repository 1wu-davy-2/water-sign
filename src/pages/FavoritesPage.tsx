import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { TemplateCard } from '../components/TemplateCard'
import { speechTemplates } from '../data/speech-templates'
import { useFavorites } from '../lib/favorites'

export function FavoritesPage() {
  const { ids, clear } = useFavorites()
  const [confirming, setConfirming] = useState(false)

  // 按收藏顺序展示，而不是按模板库顺序——用户记得的是「我刚收藏了什么」。
  // 同时过滤掉已不存在的 id（内容改过名之后 localStorage 里可能残留旧 id）。
  const items = useMemo(
    () =>
      ids
        .map((id) => speechTemplates.find((tpl) => tpl.id === id))
        .filter((tpl) => tpl !== undefined),
    [ids],
  )

  // 用解析后的 items.length，而不是存储里的 ids.length：
  // 两者不一致时（存在失效 id）会出现「已收藏 1 条」却显示空状态的矛盾。
  const count = items.length

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foam-100">我的收藏</h1>
          <p className="text-sm text-foam-400">
            {count > 0 ? `已收藏 ${count} 条话术。` : '还没有收藏任何话术。'}
          </p>
        </div>

        {/* 清空是不可撤销的，做成两步确认而不是点一下就抹掉 */}
        {count > 0 &&
          (confirming ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-foam-400">确定清空？</span>
              <button
                type="button"
                onClick={() => {
                  clear()
                  setConfirming(false)
                }}
                className="rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-500/20"
              >
                确认清空
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-abyss-600 px-3 py-1.5 text-xs text-foam-400 transition hover:text-foam-200"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-lg border border-abyss-600 px-3 py-1.5 text-xs text-foam-400 transition hover:border-red-500/60 hover:text-red-300"
            >
              清空收藏
            </button>
          ))}
      </header>

      {count === 0 ? (
        <div className="surface flex flex-col items-center gap-3 rounded-2xl px-6 py-16 text-center">
          <span aria-hidden="true" className="text-2xl text-foam-500">
            ★
          </span>
          <p className="text-sm text-foam-400">在话术库里点星标，就能把话术收在这里。</p>
          <Link
            to="/templates"
            className="mt-1 rounded-lg border border-tide-500/50 bg-tide-500/10 px-4 py-2 text-sm text-tide-300 transition hover:bg-tide-500/20"
          >
            去话术库看看
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((tpl) => (
            <TemplateCard key={tpl.id} template={tpl} showScene />
          ))}
        </div>
      )}
    </div>
  )
}
