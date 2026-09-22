import type { ComponentPropsWithoutRef, JSX } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * 正文 Markdown 渲染。
 *
 * 策略：用 typography 插件的 `prose` 提供基础排版节奏（列表、嵌套、间距），
 * 只对需要结构性改造的元素做组件级覆盖（表格要横向滚动容器、引用块要卡片化）。
 *
 * `react-markdown` 会向自定义组件注入 `node` 属性，直接展开到 DOM 上会触发
 * React 的未知属性警告，因此每个覆盖都先把它剥离。
 */

type MdProps<T extends keyof JSX.IntrinsicElements> = { node?: unknown } & ComponentPropsWithoutRef<T>

interface MarkdownProps {
  children: string
  className?: string
}

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div
      className={[
        'prose prose-invert max-w-none',
        'prose-p:leading-[1.9] prose-li:leading-[1.85] prose-li:my-1',
        'prose-headings:scroll-mt-24',
        className ?? '',
      ].join(' ')}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}

const components = {
  h1: ({ node, ...rest }: MdProps<'h1'>) => {
    void node
    return <h1 className="text-2xl font-bold tracking-tight text-foam-100" {...rest} />
  },

  h2: ({ node, ...rest }: MdProps<'h2'>) => {
    void node
    return (
      <h2
        className="mt-10 mb-4 border-l-2 border-tide-500 pl-3 text-xl font-semibold tracking-tight text-foam-100"
        {...rest}
      />
    )
  },

  h3: ({ node, ...rest }: MdProps<'h3'>) => {
    void node
    return (
      <h3
        className="mt-8 mb-3 flex items-center gap-2 text-base font-semibold text-foam-100 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-tide-400 before:content-['']"
        {...rest}
      />
    )
  },

  h4: ({ node, ...rest }: MdProps<'h4'>) => {
    void node
    return <h4 className="mt-6 mb-2 text-sm font-semibold text-foam-200" {...rest} />
  },

  p: ({ node, ...rest }: MdProps<'p'>) => {
    void node
    return <p className="text-[0.95rem]" {...rest} />
  },

  strong: ({ node, ...rest }: MdProps<'strong'>) => {
    void node
    return <strong className="font-semibold text-foam-100" {...rest} />
  },

  a: ({ node, ...rest }: MdProps<'a'>) => {
    void node
    return (
      <a
        className="font-medium text-tide-300 underline decoration-tide-500/40 underline-offset-2 transition hover:decoration-tide-300"
        {...rest}
      />
    )
  },

  blockquote: ({ node, ...rest }: MdProps<'blockquote'>) => {
    void node
    return (
      <blockquote
        className="my-5 rounded-r-xl border-l-2 border-tide-500 bg-abyss-850/70 py-3 pr-4 pl-4 text-foam-200 not-italic [&>p]:my-1 [&>p]:before:content-none [&>p]:after:content-none"
        {...rest}
      />
    )
  },

  ul: ({ node, ...rest }: MdProps<'ul'>) => {
    void node
    return <ul className="my-4 space-y-1.5 pl-1 marker:text-tide-500" {...rest} />
  },

  ol: ({ node, ...rest }: MdProps<'ol'>) => {
    void node
    return <ol className="my-4 space-y-1.5 pl-1 marker:font-medium marker:text-tide-400" {...rest} />
  },

  // 表格在移动端会撑破布局，套一层横向滚动容器
  table: ({ node, ...rest }: MdProps<'table'>) => {
    void node
    return (
      <div className="my-6 overflow-x-auto rounded-xl border border-abyss-700">
        <table className="my-0 w-full border-collapse text-sm" {...rest} />
      </div>
    )
  },

  thead: ({ node, ...rest }: MdProps<'thead'>) => {
    void node
    return <thead className="bg-abyss-850" {...rest} />
  },

  th: ({ node, ...rest }: MdProps<'th'>) => {
    void node
    return (
      <th
        className="border-b border-abyss-700 px-4 py-2.5 text-left font-semibold text-foam-100 whitespace-nowrap"
        {...rest}
      />
    )
  },

  td: ({ node, ...rest }: MdProps<'td'>) => {
    void node
    return <td className="border-b border-abyss-800 px-4 py-2.5 align-top text-foam-300" {...rest} />
  },

  code: ({ node, ...rest }: MdProps<'code'>) => {
    void node
    return (
      <code
        className="rounded-md bg-abyss-800 px-1.5 py-0.5 font-mono text-[0.85em] text-mist-300 before:content-none after:content-none"
        {...rest}
      />
    )
  },

  pre: ({ node, ...rest }: MdProps<'pre'>) => {
    void node
    return (
      <pre
        className="my-5 overflow-x-auto rounded-xl border border-abyss-700 bg-abyss-900 p-4 text-sm"
        {...rest}
      />
    )
  },

  hr: ({ node, ...rest }: MdProps<'hr'>) => {
    void node
    return <hr className="my-8 border-abyss-700" {...rest} />
  },
}
