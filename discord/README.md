# 绮灵 Discord 机器人

连接 [绮灵 Brain](../server/) 后端，与网页共用同一套 API Key 和训练数据。

## 配置

```bash
cp .env.example .env
```

| 变量 | 获取方式 |
|------|----------|
| `DISCORD_TOKEN` | [Discord Developer Portal](https://discord.com/developers/applications) → Bot → Token |
| `DISCORD_CLIENT_ID` | Application → General Information → Application ID |
| `QILING_API_URL` | 绮灵后端地址，如 `http://localhost:3001` |
| `QILING_API_KEY` | 在网页或 API 注册的 Key |

## 启动

```bash
npm install
npm run register   # 首次注册斜杠命令
npm start
```

## 命令

- `/chat message:你好` — 对话
- `/query q:量子纠缠` — 资料查询
- `/train question:... answer:...` — 训练
- `/status` — 速率和配额
- `/help` — 帮助

## 邀请机器人

OAuth2 URL Generator → scopes: `bot`, `applications.commands` → permissions: Send Messages, Embed Links
