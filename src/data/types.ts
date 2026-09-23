/**
 * 内容层类型定义。
 *
 * 全站内容以结构化数据存放，前端只做检索与展示：
 * - `modules.ts`  —— 五个教学模块的正文（Markdown 字符串）
 * - `speech-templates.ts` —— 可复制的话术模板库（结构化，便于筛选/收藏/搜索）
 *
 * 注意：本项目 tsconfig 开启了 `erasableSyntaxOnly`，因此**不能使用 `enum`**，
 * 一律用 `as const` 对象 + 联合类型代替。
 */

/** 水象三座。 */
export type Zodiac = 'cancer' | 'scorpio' | 'pisces'

/** 内容适用范围：某个具体星座，或 `all` 表示三座通用。 */
export type ZodiacScope = Zodiac | 'all'

/**
 * ⚠️ 星座符号后面跟的 `︎` 是「文本表现选择符」。
 * U+2648–U+2653 这段星座符号在 Unicode 里**默认是 emoji 表现**，
 * 不加选择符时浏览器会用彩色 emoji 字体渲染，在正文小字号里会变成
 * 一个和文字完全不搭的彩色方块。加上 U+FE0E 强制走文本字形。
 */
export const ZODIAC_META = {
  all: { label: '通用', short: '通用', symbol: '≈', trait: '三个水象星座都适用' },
  cancer: { label: '巨蟹座', short: '巨蟹', symbol: '♋︎', trait: '安全感 + 被需要' },
  scorpio: { label: '天蝎座', short: '天蝎', symbol: '♏︎', trait: '深度连接 + 忠诚与占有' },
  pisces: { label: '双鱼座', short: '双鱼', symbol: '♓︎', trait: '理想化 + 精神共鸣' },
} as const satisfies Record<ZodiacScope, { label: string; short: string; symbol: string; trait: string }>

/** 话术场景。模板库与筛选器共用这套 key。 */
export type Scene =
  | 'icebreaker'
  | 'warming'
  | 'crush'
  | 'tension'
  | 'cold'
  | 'conflict'
  | 'depth'
  | 'boundary'

export const SCENE_META = {
  icebreaker: { label: '开场破冰', hint: '第一次开口、久未联系后的重启' },
  warming: { label: '日常升温', hint: '把普通对话聊出情绪温度' },
  crush: { label: '表达好感', hint: '不直球，但让对方明确感到被在意' },
  tension: { label: '制造张力', hint: '暧昧期的推拉与心跳感' },
  cold: { label: '冷淡应对', hint: '对方回复变慢、抽离、已读不回' },
  conflict: { label: '冲突修复', hint: '吵架后、误会后重新接上' },
  depth: { label: '深度连接', hint: '聊脆弱、恐惧、过往与未来' },
  boundary: { label: '边界表达', hint: '表达自己的需求与底线，不指责' },
} as const satisfies Record<Scene, { label: string; hint: string }>

/** 模块内的一个小节。 */
export interface Section {
  id: string
  title: string
  /**
   * Markdown 正文。支持 `###` 小标题、`**粗体**`、`-` 无序列表、
   * `1.` 有序列表、`>` 引用块。
   */
  content: string
  /** 该小节针对的星座；省略表示通用。 */
  zodiac?: ZodiacScope[]
  /** 检索用补充关键词（正文里没出现、但用户可能会搜的说法）。 */
  keywords?: string[]
  /** 在该小节正文下方内联展示的话术场景。 */
  relatedTemplates?: Scene[]
}

/** 一个教学模块。 */
export interface Module {
  id: string
  order: number
  title: string
  /** 导航/面包屑用的短标题。 */
  shortTitle: string
  description: string
  /** 模块图标字符。 */
  symbol: string
  /** 卡片与页头用的 Tailwind 渐变类。 */
  accent: string
  /**
   * 标记为「星座专属模块」。省略表示这是三座通用的心法模块。
   * 首页据此把模块分成「通用心法」和「按星座深入」两组。
   */
  sign?: Zodiac
  sections: Section[]
}

/** 一条可复制的话术模板。 */
export interface SpeechTemplate {
  id: string
  scene: Scene
  text: string
  zodiac: ZodiacScope[]
  tags: string[]
  /** 这句话为什么有效。 */
  why?: string
}

/** 检索结果。 */
export interface SearchHit {
  moduleId: string
  moduleTitle: string
  sectionId: string
  sectionTitle: string
  /** 命中的纯文本片段（未高亮，由组件负责标注）。 */
  snippet: string
  score: number
}
