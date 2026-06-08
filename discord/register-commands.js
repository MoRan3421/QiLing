import 'dotenv/config'
import { REST, Routes, SlashCommandBuilder } from 'discord.js'

const commands = [
  new SlashCommandBuilder()
    .setName('chat')
    .setDescription('跟绮灵聊天')
    .addStringOption((o) => o.setName('message').setDescription('你想说什么').setRequired(true))
    .addStringOption((o) =>
      o.setName('mode').setDescription('模式')
        .addChoices(
          { name: '可爱', value: 'cute' },
          { name: '专业', value: 'pro' },
          { name: '创作', value: 'creative' },
          { name: '学霸', value: 'learn' },
        )
    ),
  new SlashCommandBuilder()
    .setName('query')
    .setDescription('查询绮灵资料库')
    .addStringOption((o) => o.setName('q').setDescription('查询关键词').setRequired(true))
    .addStringOption((o) =>
      o.setName('type').setDescription('资料类型')
        .addChoices(
          { name: '全部', value: 'all' },
          { name: '百科', value: 'wiki' },
          { name: 'FAQ', value: 'faq' },
          { name: '训练知识', value: 'knowledge' },
        )
    ),
  new SlashCommandBuilder()
    .setName('train')
    .setDescription('训练绮灵（教导新知识）')
    .addStringOption((o) => o.setName('question').setDescription('问题/触发词').setRequired(true))
    .addStringOption((o) => o.setName('answer').setDescription('绮灵应该回答').setRequired(true)),
  new SlashCommandBuilder()
    .setName('status')
    .setDescription('查看绮灵状态和速率限制'),
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('绮灵 Discord 机器人帮助'),
].map((c) => c.toJSON())

const token = process.env.DISCORD_TOKEN
const clientId = process.env.DISCORD_CLIENT_ID

if (!token || !clientId) {
  console.error('请设置 DISCORD_TOKEN 和 DISCORD_CLIENT_ID')
  process.exit(1)
}

const rest = new REST({ version: '10' }).setToken(token)
await rest.put(Routes.applicationCommands(clientId), { body: commands })
console.log('✅ 绮灵 Discord 斜杠命令已注册')
