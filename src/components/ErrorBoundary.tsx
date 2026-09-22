import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * 顶层错误边界。
 *
 * React 19 里渲染期/副作用里未捕获的异常会卸载整棵树，结果是**纯白屏**，
 * 用户既看不到原因也没有恢复入口。这里兜住异常，至少给一个能返回首页的页面。
 *
 * 错误边界必须是 class 组件（React 没有函数式的等价物）。
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 目前没有接监控服务，先打到控制台，方便排查
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-24 text-center">
        <span aria-hidden="true" className="text-3xl text-foam-500">
          ≈
        </span>
        <h1 className="text-xl font-semibold text-foam-100">页面出了点问题</h1>
        <p className="text-sm leading-relaxed text-foam-400">
          很抱歉，这个页面渲染失败了。你可以返回首页重新开始。
        </p>
        <pre className="w-full overflow-x-auto rounded-xl border border-abyss-700 bg-abyss-900 p-3 text-left text-xs text-foam-500">
          {error.message}
        </pre>
        <a
          href="/"
          className="mt-1 rounded-lg border border-tide-500/50 bg-tide-500/10 px-4 py-2 text-sm text-tide-300 transition hover:bg-tide-500/20"
        >
          返回首页
        </a>
      </div>
    )
  }
}
