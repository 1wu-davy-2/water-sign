import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 复制到剪贴板，并在 1.6 秒内返回「已复制」状态。
 *
 * `navigator.clipboard` 在非 HTTPS 环境（例如用局域网 IP 访问 dev server）不可用，
 * 因此保留 `document.execCommand('copy')` 作为降级路径。
 */
export function useCopy(resetAfterMs = 1600) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const copy = useCallback(
    async (text: string) => {
      const ok = await writeClipboard(text)
      if (!ok) return false

      setCopied(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), resetAfterMs)
      return true
    },
    [resetAfterMs],
  )

  return { copied, copy }
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // 落到下面的降级实现
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}
