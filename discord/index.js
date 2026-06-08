/**
 * 绮灵 Discord 机器人 — 完整交互系统 v3.0
 */
import 'dotenv/config'
import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'

const TOKEN = process.env.DISCORD_TOKEN
const API_URL = process.env.QILING_API_URL || 'http://localhost:3001/api'
const API_KEY = process.env.QILING_API_KEY || ''
const ADMIN_USERS = (process.env.DISCORD_ADMINS || '').split(',').filter(Boolean)

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
})

// ── 指令定义 ──
const commands = [
  new SlashCommandBuilder()
    .setName('chat')
    .setDescription('与绮灵对话')
    .addStringOption(opt => opt.setName('message').setDescription('你想说的话').setRequired(true))
    .addStringOption(opt => opt.setName('mode').setDescription('回复风格').addChoices({name:'可爱',value:'cute'},{name:'专业',value:'pro'}))
    .addBooleanOption(opt => opt.setName('tools').setDescription('启用工具调用')),
    
  new SlashCommandBuilder()
    .setName('train')
    .setDescription('训练绮灵新知识')
    .addStringOption(opt => opt.setName('question').setDescription('问题').setRequired(true))
    .addStringOption(opt => opt.setName('answer').setDescription('回答').setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('delete_knowledge')
    .setDescription('删除训练过的知识'),
    
  new SlashCommandBuilder()
    .setName('version')
    .setDescription('查看当前版本信息'),
    
  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('查看绮灵统计信息'),
    
  new SlashCommandBuilder()
    .setName('auto_train')
    .setDescription('手动触发自动训练循环'),
    
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('查看机器人帮助信息'),
]

// ── 注册指令 ──
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(TOKEN)
  
  try {
    console.log('📝 注册 Discord 指令...')
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands })
    console.log('✅ Discord 指令注册成功')
  } catch (e) {
    console.error('指令注册失败:', e)
  }
}

// ── API 调用 ──
async function callAPI(endpoint, body) {
  const res = await fetch(API_URL + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: JSON.stringify(body)
  })
  return await res.json()
}

async function callAPIGet(endpoint) {
  const res = await fetch(API_URL + endpoint, {
    headers: { 'x-api-key': API_KEY }
  })
  return await res.json()
}

// ── 消息处理 ──
client.on('messageCreate', async (message) => {
  if (message.author.bot) return
  
  // DM 自动对话
  if (message.channel.type === 1) {
    await message.channel.sendTyping()
    const result = await callAPI('/chat', { message: message.content, mode: 'cute' })
    await message.reply(result.response)
  }
})

// ── 交互处理 ──
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return
  
  const { commandName, options, user } = interaction
  
  try {
    switch (commandName) {
      case 'chat': {
        await interaction.deferReply()
        const msg = options.getString('message')
        const mode = options.getString('mode') || 'cute'
        const useTools = options.getBoolean('tools') || false
        
        const result = await callAPI('/chat', {
          message: msg,
          mode,
          useTools
        })
        
        const embed = new EmbedBuilder()
          .setColor(0x9B59B6)
          .setTitle('✨ 绮灵')
          .setDescription(result.response?.slice(0, 2000) || '绮灵正在思考中...')
          .setFooter({ text: '绮灵 v3 — 越用越强' })
          .setTimestamp()
        
        if (result.version) {
          embed.addFields({ name: '版本', value: 'v' + result.version.version, inline: true })
        }
        
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('chat_more_' + Date.now()).setLabel('继续对话').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('train_' + Date.now()).setLabel('👍 好回答').setStyle(ButtonStyle.Success)
        )
        
        await interaction.editReply({ embeds: [embed], components: [row] })
        break
      }
      
      case 'train': {
        await interaction.deferReply()
        const question = options.getString('question')
        const answer = options.getString('answer')
        
        const result = await callAPI('/train', { question, answer })
        
        const embed = new EmbedBuilder()
          .setColor(0x2ECC71)
          .setTitle('🧠 训练成功！')
          .setDescription('绮灵记住了新知识！')
          .addFields(
            { name: '问题', value: question.slice(0, 500) },
            { name: '回答', value: answer.slice(0, 1000) },
            { name: '知识库总数', value: String(result.total || '?') }
          )
          .setTimestamp()
        
        await interaction.editReply({ embeds: [embed] })
        break
      }
      
      case 'delete_knowledge': {
        await interaction.deferReply()
        const knowledge = await callAPIGet('/train/knowledge')
        const list = knowledge.knowledge || []
        
        if (list.length === 0) {
          await interaction.editReply('📭 知识库为空')
          return
        }
        
        const embed = new EmbedBuilder()
          .setColor(0xE74C3C)
          .setTitle('🗑️ 知识库列表')
          .setDescription(list.map((k, i) => `${i}. **${k.q}** → ${k.a.slice(0, 50)}...`).join('\n').slice(0, 2000))
        
        await interaction.editReply({ embeds: [embed] })
        break
      }
      
      case 'version': {
        await interaction.deferReply()
        const versions = await callAPIGet('/version')
        const current = await callAPIGet('/version/current')
        
        const embed = new EmbedBuilder()
          .setColor(0x9B59B6)
          .setTitle('📊 绮灵版本信息')
          .setDescription('当前版本: **v' + current.version + '**「' + current.codename + '」')
          .addFields(
            { name: '能力', value: (current.capabilities || []).join('\n').slice(0, 1000) || '无' },
            { name: '训练周期', value: String(current.trainingCycles || 0), inline: true },
            { name: '迭代次数', value: String(current.iteration || 0), inline: true },
            { name: '发布日期', value: current.date || '未知', inline: true }
          )
          .setFooter({ text: '版本数量: ' + (versions?.length || 1) })
          .setTimestamp()
        
        await interaction.editReply({ embeds: [embed] })
        break
      }
      
      case 'stats': {
        await interaction.deferReply()
        const stats = await callAPIGet('/stats')
        
        const embed = new EmbedBuilder()
          .setColor(0x3498DB)
          .setTitle('📈 绮灵统计')
          .addFields(
            { name: '版本', value: (stats.version?.version || '?'), inline: true },
            { name: '知识库', value: String(stats.vectorCount || 0), inline: true },
            { name: '记忆', value: String(stats.memoryCount || 0), inline: true },
            { name: '训练对', value: String(stats.trainingPairs || 0), inline: true },
            { name: '运行时间', value: Math.floor(stats.uptime || 0) + 's', inline: true }
          )
          .setTimestamp()
        
        await interaction.editReply({ embeds: [embed] })
        break
      }
      
      case 'auto_train': {
        if (!ADMIN_USERS.includes(user.id)) {
          await interaction.reply({ content: '❌ 仅管理员可用', ephemeral: true })
          return
        }
        
        await interaction.deferReply()
        const result = await callAPI('/train/auto', {})
        
        const embed = new EmbedBuilder()
          .setColor(0x9B59B6)
          .setTitle('🔄 自动训练完成')
          .addFields(
            { name: '处理对话', value: String(result.processed || 0), inline: true },
            { name: '提取对', value: String(result.extracted || 0), inline: true },
            { name: '过滤后', value: String(result.filtered || 0), inline: true },
            { name: '去重后', value: String(result.deduped || 0), inline: true },
            { name: '新增', value: String(result.added || 0), inline: true }
          )
          .setTimestamp()
        
        await interaction.editReply({ embeds: [embed] })
        break
      }
      
      case 'help': {
        const embed = new EmbedBuilder()
          .setColor(0x9B59B6)
          .setTitle('✨ 绮灵 Discord 帮助')
          .setDescription('自研可训练 AI 伙伴 — 越用越强！')
          .addFields(
            { name: '/chat <消息>', value: '与绮灵对话', inline: true },
            { name: '/train <问题> <回答>', value: '训练绮灵新知识', inline: true },
            { name: '/delete_knowledge', value: '删除训练数据', inline: true },
            { name: '/version', value: '查看版本信息', inline: true },
            { name: '/stats', value: '查看统计', inline: true },
            { name: '/auto_train', value: '触发自动训练 (管理员)', inline: true },
            { name: '/help', value: '显示此帮助', inline: true }
          )
          .setFooter({ text: '绮灵 v3 — 完全自研引擎' })
          .setTimestamp()
        
        await interaction.reply({ embeds: [embed] })
        break
      }
    }
  } catch (e) {
    console.error('指令处理失败:', commandName, e.message)
    
    if (interaction.deferred) {
      await interaction.editReply({ content: '❌ 处理失败: ' + e.message })
    } else {
      await interaction.reply({ content: '❌ 处理失败: ' + e.message, ephemeral: true })
    }
  }
})

// ── 按钮交互 ──
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return
  
  try {
    if (interaction.customId.startsWith('chat_more_')) {
      await interaction.reply({ content: '在聊天频道直接 @绮灵 或 DM 我继续对话吧～ 💜', ephemeral: true })
    }
    
    if (interaction.customId.startsWith('train_')) {
      await interaction.reply({ content: '👍 感谢反馈！绮灵会更努力的～', ephemeral: true })
    }
  } catch (e) {
    console.error('按钮处理失败:', e.message)
  }
})

// ── 启动 ──
client.once('ready', async () => {
  console.log('✅ Discord 机器人已上线: ' + client.user.tag)
  await registerCommands()
})

client.login(TOKEN).catch(e => {
  console.error('Discord 登录失败:', e.message)
  process.exit(1)
})