import { useEffect } from 'react'
import { useLocation } from 'react-router'

/**
 * 路由切换时的滚动复位。
 *
 * 有 `#hash` 时滚到对应锚点，否则回到顶部。因为 `html` 上开了
 * `scroll-behavior: smooth`，直接 `scrollTo(0,0)` 会变成一段缓慢的动画，
 * 长页面上很难受——所以临时把 smooth 关掉再滚。
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      // ⚠️ 这里**不能**用 `document.querySelector(hash)`。
      // 片段不保证是合法的 CSS 选择器：`#1`、`#-1`、`#1a`、`#%` 都会让
      // querySelector 抛 SyntaxError。在 useEffect 里抛错会让 React 卸载
      // 整棵树 —— 页面直接白屏，且没有任何恢复入口。
      // 另外片段可能是百分号编码的（`#%E5%AE%89`），要先解码。
      let target: HTMLElement | null = null
      try {
        target = document.getElementById(decodeURIComponent(hash.slice(1)))
      } catch {
        // decodeURIComponent 遇到不合法的百分号序列会抛 URIError
        target = null
      }

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }

    const html = document.documentElement
    const previous = html.style.scrollBehavior
    html.style.scrollBehavior = 'auto'
    window.scrollTo(0, 0)
    html.style.scrollBehavior = previous
  }, [pathname, hash])

  return null
}
