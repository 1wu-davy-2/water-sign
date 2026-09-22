import { useCallback, useSyncExternalStore } from 'react'

/**
 * 话术收藏（本机存储）。
 *
 * 用模块级的迷你 store + `useSyncExternalStore`，而不是 Context：
 * 收藏状态被卡片、导航栏、收藏页同时读取，Context 需要包 Provider 且会让
 * 整棵子树重渲染；这里只有订阅者自己重渲染。
 *
 * 数据只写在浏览器 localStorage，不上传任何服务器。
 */

const STORAGE_KEY = 'water-love-guide:favorites'

function readStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is string => typeof id === 'string')
  } catch {
    // 隐私模式 / 存储被禁用 / JSON 损坏 —— 一律降级为「无收藏」，不抛错。
    return []
  }
}

let favorites: string[] = readStorage()
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): string[] {
  return favorites
}

function persist(next: string[]) {
  favorites = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // 写失败（配额/隐私模式）不影响本次会话内的状态。
  }
  emit()
}

/** 跨标签页同步。 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    // event.key 为 null 表示另一个标签页调用了 localStorage.clear()，
    // 这时同样要重新读取，否则本标签页会一直显示已经失效的收藏。
    if (event.key !== STORAGE_KEY && event.key !== null) return
    favorites = readStorage()
    emit()
  })
}

function toggleFavorite(id: string) {
  persist(favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id])
}

export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids])
  const toggle = useCallback((id: string) => toggleFavorite(id), [])
  const clear = useCallback(() => persist([]), [])

  return { ids, isFavorite, toggle, clear, count: ids.length }
}
