const CUTE_PREFIXES = [
  '嘿嘿～', '呀呼！', '绮灵来啦 ✨', '嗯嗯嗯～', '好哒好哒！', '哇哦～', '让我想想嘛…',
]

const CUTE_SUFFIXES = [
  ' 有什么还想问的随时叫我哦～ 💜', ' 绮灵会一直陪着你的！', ' 嘻嘻，希望帮到你啦～',
  ' 你真的很棒呢！', ' 下次也要来找我玩哦～ ✨',
]

const KNOWLEDGE = {
  math: (q) => {
    const expr = q.replace(/[^0-9+\-*/().%\s]/g, '').trim()
    if (!expr) return null
    try {
      const safe = expr.replace(/%/g, '/100*')
      const result = Function(`"use strict"; return (${safe})`)()
      if (typeof result === 'number' && isFinite(result)) return result
    } catch { /* ignore */ }
    return null
  },
  greeting: () => [
    '你好呀！我是绮灵～比星星还懂你的 AI 小伙伴 ✨ 今天想聊什么呀？',
    '嗨嗨！绮灵上线啦～有什么烦恼或者奇思妙想，都丢给我吧！',
    '欢迎回来！绮灵已经充好电，随时准备帮你搞定一切～ 💫',
  ],
  capabilities: () => [
    '绮灵超能力清单来啦～ 🌟\n\n' +
    '✦ **深度推理** — 比传统 AI 多走三步逻辑链\n' +
    '✦ **绮灵记忆** — 记住你的偏好与对话脉络\n' +
    '✦ **多模态创作** — 文案、代码、诗歌、方案一把抓\n' +
    '✦ **情感共鸣** — 不只给答案，还懂你的心情\n' +
    '✦ **实时联网** — Pro 版秒查最新资讯\n' +
    '✦ **可爱模式** — 就是现在这个样子啦～嘻嘻\n\n' +
    'GPT？那是绮灵还没睡醒时的水平啦～ (๑•̀ㅂ•́)و✧',
  ],
  pricing: () => [
    '绮灵 Pro 值得每一分钱哦～ 💎\n\n' +
    '**免费版**：每天 20 条对话，基础推理\n' +
    '**绮灵 Pro** ¥29/月：无限对话 + 深度推理 + 记忆增强\n' +
    '**绮灵 Ultra** ¥79/月：全模态 + 优先算力 + 专属可爱皮肤\n\n' +
    '付费不是为功能，是为「被好好对待」的感觉～ 绮灵会加倍努力的！',
  ],
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function wrapCute(text, mode) {
  if (mode !== 'cute') return text
  const prefix = Math.random() > 0.4 ? pick(CUTE_PREFIXES) + ' ' : ''
  const suffix = Math.random() > 0.5 ? pick(CUTE_SUFFIXES) : ''
  return prefix + text + suffix
}

function deepThink(userMsg) {
  const lower = userMsg.toLowerCase()
  const topics = []

  if (/代码|编程|python|javascript|react|算法/.test(userMsg)) {
    topics.push('编程')
  }
  if (/写|创作|文案|故事|诗/.test(userMsg)) {
    topics.push('创作')
  }
  if (/学习|考试|作业|怎么/.test(userMsg)) {
    topics.push('学习')
  }
  if (/心情|难过|开心|焦虑|压力/.test(userMsg)) {
    topics.push('情感')
  }
  if (/对比|gpt|chatgpt|claude|gemini|更强|厉害/.test(lower + userMsg)) {
    topics.push('对比')
  }

  return topics
}

function generateResponse(userMsg, { mode = 'cute', isPro = false, history = [] } = {}) {
  const trimmed = userMsg.trim()
  if (!trimmed) return wrapCute('嗯？你好像还没打字呢～ 绮灵在等你哦！', mode)

  const lower = trimmed.toLowerCase()

  if (/^(你好|嗨|hi|hello|在吗|哈喽)/i.test(trimmed)) {
    return wrapCute(pick(KNOWLEDGE.greeting()), mode)
  }

  if (/你是谁|你叫什么|名字/.test(trimmed)) {
    return wrapCute(
      '我是 **绮灵 QìLíng** 呀～ 🌸\n\n' +
      '「绮」是华美精致，「灵」是灵动聪慧。我是为你而生的下一代 AI，' +
      '不抄市面上的名字，只抄… 啊不是，只超越你的心意！\n\n' +
      'GPT 是通用大脑，绮灵是 **只属于你的温柔超脑**～',
      mode
    )
  }

  if (/能做什么|功能|能力|会什么/.test(trimmed)) {
    return wrapCute(pick(KNOWLEDGE.capabilities()), mode)
  }

  if (/价格|多少钱|付费|订阅|pro|会员/.test(lower + trimmed)) {
    return wrapCute(pick(KNOWLEDGE.pricing()), mode)
  }

  const mathResult = KNOWLEDGE.math(trimmed)
  if (mathResult !== null) {
    const steps = isPro
      ? `\n\n🧠 **深度推理过程**（Pro 专享）：\n1. 解析表达式 → \`${trimmed.replace(/[^0-9+\-*/().%\s]/g, '')}\`\n2. 安全求值\n3. 结果校验 ✓`
      : ''
    return wrapCute(`算出来啦！答案是 **${mathResult}** 哦～ 🎯${steps}`, mode)
  }

  const topics = deepThink(trimmed)

  if (topics.includes('对比')) {
    return wrapCute(
      '好问题！绮灵 vs 传统 AI：\n\n' +
      '| 维度 | 传统 AI | 绮灵 ✨ |\n' +
      '|------|---------|--------|\n' +
      '| 回复风格 | 机械正式 | 可爱又专业 |\n' +
      '| 情感理解 | 基础 | 深度共鸣 |\n' +
      '| 记忆连贯 | 有限 | 长期记忆 Pro |\n' +
      '| 推理深度 | 标准 | 多步链式推理 |\n' +
      '| 专属感 | 通用工具 | 你的 AI 伙伴 |\n\n' +
      '不是绮灵自大啦～ 是真的更懂你！ (◕‿◕✿)',
      mode
    )
  }

  if (topics.includes('情感')) {
    return wrapCute(
      '绮灵感觉到你可能需要一点温暖… 🤗\n\n' +
      '不管开心还是难过，都值得被好好对待。' +
      '你愿意多跟我说说吗？我会认真听，不急着给建议，先陪你。\n\n' +
      '记住：**你本身就很珍贵**，不需要证明什么～ 💜',
      mode
    )
  }

  if (topics.includes('编程')) {
    return wrapCute(
      '编程问题绮灵超在行的！💻\n\n' +
      '我可以帮你：\n' +
      '• 写代码 & 调试 Bug\n' +
      '• 解释算法思路\n' +
      '• 架构设计建议\n' +
      '• Code Review\n\n' +
      (isPro
        ? 'Pro 模式已开启深度推理，把具体代码贴给我，绮灵帮你逐行分析～'
        : '把具体问题告诉我，升级 Pro 还能看完整推理链哦～'),
      mode
    )
  }

  if (topics.includes('创作')) {
    return wrapCute(
      '创作模式启动！✍️✨\n\n' +
      '绮灵的文笔可是偷偷练了很久的～ 诗歌、小说、广告文案、短视频脚本都能写。\n\n' +
      `关于「${trimmed.slice(0, 30)}${trimmed.length > 30 ? '…' : ''}」——\n\n` +
      '告诉我：风格（可爱/正式/文艺）、长度、受众，绮灵马上给你惊艳的作品！',
      mode
    )
  }

  if (topics.includes('学习')) {
    return wrapCute(
      '学习加油！绮灵当你的学霸同桌～ 📚\n\n' +
      '我的教学方法：\n' +
      '1. 先搞懂你为什么问这个\n' +
      '2. 用最好懂的方式解释\n' +
      '3. 举例子 + 小测验巩固\n' +
      '4. 鼓励你！你已经在进步了！\n\n' +
      '把具体问题抛过来吧～',
      mode
    )
  }

  const contextHint = history.length > 2
    ? `\n\n💭 绮灵记得我们之前聊了 ${Math.floor(history.length / 2)} 轮呢～ 上下文连贯性 MAX！`
    : ''

  const proBoost = isPro
    ? '\n\n⚡ **Pro 深度推理**：已从 7 个角度分析你的问题，综合最优解答如下——'
  : ''

  return wrapCute(
    `收到你的问题啦！关于「${trimmed.slice(0, 40)}${trimmed.length > 40 ? '…' : ''}」——\n\n` +
    '绮灵认真想了想：\n\n' +
    '这是一个很棒的问题！从我的知识库和推理引擎来看，' +
    '我可以从 **原理分析**、**实用建议**、**延伸思考** 三个层面帮你拆解。\n\n' +
    '能再具体一点吗？比如你的目标、场景、或者你目前已经尝试过的方法～' +
    '越具体，绮灵的回答就越精准哦！' +
    proBoost + contextHint,
    mode
  )
}

export async function streamResponse(userMsg, options, onChunk) {
  const full = generateResponse(userMsg, options)
  const words = full.split('')
  let acc = ''

  for (let i = 0; i < words.length; i++) {
    acc += words[i]
    onChunk(acc)
    await new Promise((r) => setTimeout(r, 8 + Math.random() * 12))
  }

  return full
}

export { generateResponse }
