import { modules } from '../data/modules'
import { speechTemplates } from '../data/speech-templates'
import { SCENE_META, ZODIAC_META } from '../data/types'
import type { SearchHit, SpeechTemplate } from '../data/types'

/**
 * 内容检索。
 *
 * 设计取舍：全站内容只有几十 KB，直接在内存里建索引做线性扫描即可，
 * 不需要引入 Fuse.js 之类的依赖。索引在模块加载时构建一次（模块级常量），
 * 组件里再用 `useMemo` 缓存「查询 → 结果」的映射。
 */

/** 去掉 Markdown 标记，得到用于检索与摘要的纯文本。 */
export function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\s*\|[\s\-:|]+\|\s*$/gm, ' ') // 表格分隔行
    .replace(/^\s*\|.*\|\s*$/gm, (row) => row.replace(/\|/g, ' '))
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

interface SectionRecord {
  moduleId: string
  moduleTitle: string
  sectionId: string
  sectionTitle: string
  body: string
  keywords: string
}

const SECTION_INDEX: SectionRecord[] = modules.flatMap((m) =>
  m.sections.map((s) => ({
    moduleId: m.id,
    moduleTitle: m.title,
    sectionId: s.id,
    sectionTitle: s.title,
    body: toPlainText(s.content),
    keywords: (s.keywords ?? []).join(' '),
  })),
)

/**
 * 把查询串切成检索词：按空白与常见标点切分，统一小写。
 *
 * 分隔符必须覆盖**中文标点和全角括号**——正文里大量使用「已读不回」这种写法，
 * 用户直接复制粘贴过来搜索时，如果 `「」` 不被切掉，整个 `「已读不回」` 会当成
 * 一个检索词，结果一条都搜不到。emoji 同理（先替换成空格再切）。
 */
function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[\p{Extended_Pictographic}\u{fe0f}\u{200d}]/gu, ' ')
    .split(/[\s,，、。.！!？?；;：:·|/\\()[\]{}"'“”‘’「」『』（）《》〈〉【】〔〕…—～~]+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

/** 查询串是否是 `text` 的子序列（允许中间跳过字符），用于兜底模糊匹配。 */
function isSubsequence(needle: string, haystack: string): boolean {
  let i = 0
  for (let j = 0; j < haystack.length && i < needle.length; j++) {
    if (haystack[j] === needle[i]) i++
  }
  return i === needle.length
}

/** 统计 `needle` 在 `haystack` 中出现的次数。 */
function countOccurrences(needle: string, haystack: string): number {
  if (!needle) return 0
  let count = 0
  let pos = haystack.indexOf(needle)
  while (pos !== -1) {
    count++
    pos = haystack.indexOf(needle, pos + needle.length)
  }
  return count
}

const WEIGHT = { title: 12, keyword: 8, moduleTitle: 5, body: 3 } as const

function scoreTerm(record: SectionRecord, term: string): number {
  const title = record.sectionTitle.toLowerCase()
  const moduleTitle = record.moduleTitle.toLowerCase()
  const keywords = record.keywords.toLowerCase()
  const body = record.body.toLowerCase()

  let score = 0
  if (title.includes(term)) score += WEIGHT.title
  if (keywords.includes(term)) score += WEIGHT.keyword
  if (moduleTitle.includes(term)) score += WEIGHT.moduleTitle
  const bodyHits = countOccurrences(term, body)
  if (bodyHits > 0) score += WEIGHT.body + Math.min(bodyHits, 5)

  if (score > 0) return score

  // 兜底：字符级模糊匹配（例如输入「冷谈」也能命中「冷淡」）
  if (term.length >= 2) {
    if (isSubsequence(term, title)) return 2
    if (isSubsequence(term, keywords)) return 2
  }
  return 0
}

/** 截取包含首个命中词的片段。 */
function buildSnippet(body: string, terms: string[], radius = 34): string {
  const lower = body.toLowerCase()
  let at = -1
  for (const term of terms) {
    const found = lower.indexOf(term)
    if (found !== -1 && (at === -1 || found < at)) at = found
  }
  if (at === -1) return body.slice(0, radius * 2) + (body.length > radius * 2 ? '…' : '')

  const start = Math.max(0, at - radius)
  const end = Math.min(body.length, at + radius)
  return (start > 0 ? '…' : '') + body.slice(start, end).replace(/\n/g, ' ') + (end < body.length ? '…' : '')
}

/**
 * 检索正文小节。多个检索词之间是 **AND** 关系：
 * 每个词都要命中某处，命中得越多、越靠前（标题/关键词）分数越高。
 */
export function searchSections(query: string): SearchHit[] {
  const terms = tokenize(query)
  if (terms.length === 0) return []

  const hits: SearchHit[] = []
  for (const record of SECTION_INDEX) {
    let score = 0
    let matchedAll = true
    for (const term of terms) {
      const termScore = scoreTerm(record, term)
      if (termScore === 0) {
        matchedAll = false
        break
      }
      score += termScore
    }
    if (!matchedAll) continue

    hits.push({
      moduleId: record.moduleId,
      moduleTitle: record.moduleTitle,
      sectionId: record.sectionId,
      sectionTitle: record.sectionTitle,
      snippet: buildSnippet(record.body, terms),
      score,
    })
  }

  return hits.sort((a, b) => b.score - a.score)
}

/**
 * 检索话术模板。
 *
 * 与 `searchSections` 保持一致：**多个检索词之间是 AND**。
 * （早先这里是 OR，导致搜「天蝎 zzz」会返回 7 张卡片，而页面上一个高亮都没有
 * —— 用户看到一堆完全不含关键词的结果，只会以为搜索坏了。）
 */
export function searchTemplates(query: string): SpeechTemplate[] {
  const terms = tokenize(query)
  if (terms.length === 0) return []

  const scored: { tpl: SpeechTemplate; score: number }[] = []

  for (const tpl of speechTemplates) {
    const text = tpl.text.toLowerCase()
    const tags = tpl.tags.join(' ').toLowerCase()
    const why = (tpl.why ?? '').toLowerCase()
    // 把界面上**可见**的场景名/星座名也纳入检索。
    // 否则用户照着筛选器上的「冷淡应对」去搜，会一条都搜不到。
    const labels = [SCENE_META[tpl.scene].label, ...tpl.zodiac.map((z) => ZODIAC_META[z].label)]
      .join(' ')
      .toLowerCase()
    const haystack = `${text} ${tags} ${labels} ${why}`

    let score = 0
    let matchedAll = true

    for (const term of terms) {
      let termScore = 0
      if (text.includes(term)) termScore += 10
      if (tags.includes(term)) termScore += 6
      if (labels.includes(term)) termScore += 6
      if (why.includes(term)) termScore += 2
      if (termScore === 0 && isSubsequence(term, haystack)) termScore += 1

      if (termScore === 0) {
        matchedAll = false
        break
      }
      score += termScore
    }

    if (matchedAll) scored.push({ tpl, score })
  }

  return scored.sort((a, b) => b.score - a.score).map((entry) => entry.tpl)
}

export interface HighlightPart {
  text: string
  match: boolean
}

/** 把文本按命中的检索词切段，供组件做高亮渲染。 */
export function highlight(text: string, query: string): HighlightPart[] {
  const terms = tokenize(query)
  if (terms.length === 0) return [{ text, match: false }]

  const escaped = terms
    .filter((t) => t.length > 0)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length) // 长词优先，避免被短词切断

  if (escaped.length === 0) return [{ text, match: false }]

  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts: HighlightPart[] = []
  let last = 0
  for (const m of text.matchAll(pattern)) {
    const index = m.index ?? 0
    if (index > last) parts.push({ text: text.slice(last, index), match: false })
    parts.push({ text: m[0], match: true })
    last = index + m[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last), match: false })
  return parts
}
