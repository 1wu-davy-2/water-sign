import { useEffect, useState } from 'react'

/**
 * 目录滚动联动：返回当前视口中最靠上的小节 id。
 *
 * 用 IntersectionObserver 而不是监听 scroll 事件——后者要在每次滚动时
 * 读取 `getBoundingClientRect()`，会强制同步布局，长页面上明显掉帧。
 *
 * 依赖用 `ids.join('|')` 而不是数组本身：调用方通常直接内联 map 出数组，
 * 每次渲染引用都不同，用数组做依赖会导致 observer 反复重建。
 */
export function useActiveSection(ids: string[]): string | null {
  const key = ids.join('|')
  const [active, setActive] = useState<string | null>(ids[0] ?? null)

  useEffect(() => {
    const list = key ? key.split('|') : []
    if (list.length === 0) return

    const elements = list
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        // 按文档顺序取第一个可见的小节，而不是按回调顺序
        const next = list.find((id) => visible.has(id))
        if (next) setActive(next)
      },
      {
        // 顶部留出吸顶导航的高度，底部收窄以排除「刚露头」的小节
        rootMargin: '-88px 0px -55% 0px',
        threshold: 0,
      },
    )

    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [key])

  return active
}
