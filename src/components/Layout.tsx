import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { modulesByOrder } from '../data/modules'
import { useFavorites } from '../lib/favorites'
import { SearchBar } from './SearchBar'

const PRIMARY_NAV = [
  { to: '/', label: '首页', end: true },
  { to: '/templates', label: '话术库', end: false },
  { to: '/favorites', label: '我的收藏', end: false },
]

/** 全站外壳：吸顶导航 + 移动端抽屉 + 页脚。 */
export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const { count } = useFavorites()
  const toggleRef = useRef<HTMLButtonElement>(null)

  // 路由变化时关掉抽屉，否则跳转后抽屉会挂在页面上
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // 抽屉打开时锁定背景滚动
  useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [menuOpen])

  // Esc 关闭抽屉，并把焦点还给汉堡按钮
  // （否则焦点掉回 <body>，键盘用户得从头 Tab 一遍）
  useEffect(() => {
    if (!menuOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      toggleRef.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  // 抽屉和汉堡按钮都是 lg:hidden，但 body 的滚动锁只在 menuOpen 变化时解除。
  // 在窄窗口打开抽屉后把窗口拉宽（旋转屏幕 / 最大化），抽屉和按钮都消失了、
  // 滚动锁还在 —— 页面再也滚不动，而且没有任何控件能解开，只能刷新。
  useEffect(() => {
    if (!menuOpen) return
    const query = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (query.matches) setMenuOpen(false)
    }
    onChange()
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [menuOpen])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-abyss-800/80 bg-abyss-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-tide-500 to-lilac-500 text-sm font-bold text-white"
            >
              ≈
            </span>
            <span className="text-sm font-semibold tracking-tight text-foam-100 sm:text-base">
              水象恋爱实验室
            </span>
          </Link>

          <nav aria-label="主导航" className="ml-4 hidden items-center gap-1 md:flex">
            {PRIMARY_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'rounded-lg px-3 py-1.5 text-sm transition',
                    isActive
                      ? 'bg-abyss-800 font-medium text-tide-300'
                      : 'text-foam-400 hover:bg-abyss-800/60 hover:text-foam-200',
                  ].join(' ')
                }
              >
                {item.label}
                {item.to === '/favorites' && count > 0 && (
                  <span className="ml-1.5 text-[0.7rem] text-foam-500">{count}</span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto hidden w-64 lg:block xl:w-80">
            <SearchBar />
          </div>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg border border-abyss-600 text-foam-300 transition hover:border-tide-500 hover:text-tide-300 md:ml-0 lg:hidden"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="导航菜单"
          className="fixed inset-0 top-16 z-30 overflow-y-auto bg-abyss-950/97 backdrop-blur-xl lg:hidden"
        >
          <div className="flex flex-col gap-6 px-4 py-6 sm:px-6">
            <SearchBar autoFocus onNavigate={() => setMenuOpen(false)} />

            <nav aria-label="移动端导航">
              <h2 className="mb-2 text-[0.7rem] font-semibold tracking-widest text-foam-500 uppercase">
                导航
              </h2>
              <ul className="flex flex-col gap-0.5">
                {PRIMARY_NAV.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        [
                          'block rounded-lg px-3 py-2.5 text-sm transition',
                          isActive
                            ? 'bg-tide-500/15 font-medium text-tide-300'
                            : 'text-foam-300 hover:bg-abyss-800/60',
                        ].join(' ')
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="模块导航">
              <h2 className="mb-2 text-[0.7rem] font-semibold tracking-widest text-foam-500 uppercase">
                模块
              </h2>
              <ul className="flex flex-col gap-0.5">
                {modulesByOrder.map((m) => (
                  <li key={m.id}>
                    <NavLink
                      to={`/module/${m.id}`}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition',
                          isActive
                            ? 'bg-tide-500/15 font-medium text-tide-300'
                            : 'text-foam-300 hover:bg-abyss-800/60',
                        ].join(' ')
                      }
                    >
                      <span aria-hidden="true" className="text-xs opacity-70">
                        {m.symbol}
                      </span>
                      {m.shortTitle}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-abyss-800/80">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-8 text-xs text-foam-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>水象恋爱实验室 · 巨蟹 / 天蝎 / 双鱼 的聊天与关系指南</p>
          <p>
            内容仅供娱乐与自我觉察参考，不构成心理或情感咨询建议 · 收藏数据仅保存在本机浏览器
          </p>
        </div>
      </footer>
    </div>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4.5 w-4.5">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4.5 w-4.5">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  )
}
