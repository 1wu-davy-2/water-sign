import { Link } from 'react-router'

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
      <span aria-hidden="true" className="text-3xl text-foam-500">
        ≈
      </span>
      <h1 className="text-xl font-semibold text-foam-100">页面不存在</h1>
      <p className="text-sm text-foam-400">你访问的地址没有对应的内容。</p>
      <Link
        to="/"
        className="mt-2 rounded-lg border border-tide-500/50 bg-tide-500/10 px-4 py-2 text-sm text-tide-300 transition hover:bg-tide-500/20"
      >
        返回首页
      </Link>
    </div>
  )
}
