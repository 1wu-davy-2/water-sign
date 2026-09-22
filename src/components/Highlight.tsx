import { highlight } from '../lib/search'

/** 把命中检索词的部分包成 `<mark>`。 */
export function Highlight({ text, query }: { text: string; query: string }) {
  const parts = highlight(text, query)

  return (
    <>
      {parts.map((part, index) =>
        part.match ? (
          <mark
            key={index}
            className="rounded bg-tide-500/35 px-0.5 text-foam-100"
          >
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  )
}
