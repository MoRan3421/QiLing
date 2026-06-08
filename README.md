# ✨ 绮灵 QìLíng — 自研可训练 AI 伙伴

<p align="center">
  <img src="public/qiling-logo.png" width="120" alt="绮灵 Logo" />
</p>

<p align="center">
  <strong>自研推理引擎 · 向量检索 · 自动化训练 · 无限进化</strong>
</p>

<p align="center">
  不依赖外部 API，完全自主研发，越用越强，专属于你 ✨
</p>

<p align="center">
  <img src="https://img.shields.io/badge/版本-3.0.0-9B59B6" />
  <img src="https://img.shields.io/badge/状态-稳定-success" />
  <img src="https://img.shields.io/badge/许可证-MIT-blue" />
</p>

---

## 🌟 特性

| 特性 | 说明 |
|------|------|
| 🧠 **自研推理引擎** | 向量检索 + 链式推理，不依赖 OpenAI 等外部 API |
| 📚 **向量知识库** | 语义嵌入检索，比 TF-IDF 精准 10 倍 |
| 🔄 **自动化训练** | 对话挖掘 → 不确定性采样 → 去重 → 蒸馏 → 评测闭环 |
| 🌌 **版本进化** | 每轮训练提升版本，从 v1 到 v5+ 持续增强 |
| 🛠️ **工具调用** | 计算器/代码执行/文件读写/搜索/天气 |
| 🔌 **插件系统** | 表情渲染/代码高亮/自定义插件 |
| 🧠 **长期记忆** | 向量化存储 + 重要性评分 + 遗忘曲线 |
| 💬 **可爱回复** | 支持可爱/专业/普通三种风格 |
| 🔑 **API 分级** | 免费/Pro/Ultra/企业 四档 |
| 🤖 **Discord 集成** | 完整斜杠命令 /chat /train /version /stats |
| 🐳 **一键部署** | Docker / Fly.io / Oracle Cloud ARM |
| 🔒 **完全私有** | 数据不出服务器，本地存储 |

## 📊 版本演进

```
v1.0.0 🌟 绮灵初醒  — 基础对话 + TF-IDF + 手动训练
v2.0.0 🔗 灵络扩展  — API 密钥 + 限流 + Discord + 多轮对话
v3.0.0 ✨ 星识觉醒  — 语义嵌入 + 本地模型 + 长期记忆 + 工具 + 自训练
v4.0.0 🧠 智链永续  — 深度推理链 + 多模态 + 知识图谱 (规划)
v5.0.0 💎 绮灵天成  — 自监督学习 + 因果推理 + 集群分布式 (规划)
```

## 🚀 快速开始

### 方式 1：本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入 QILING_ADMIN_SECRET

# 启动后端
npm run server

# 新终端启动前端
npm run dev

# 或一键启动
npm run dev:full
```

### 方式 2：Docker 部署

```bash
docker compose up -d
```

### 方式 3：Fly.io 部署

```bash
fly launch --from fly.toml
fly secrets set QILING_ADMIN_SECRET=your-secret
fly deploy
```

### 方式 4：Oracle Cloud ARM（免费 24/7）

```bash
# 参考 scripts/deploy-oracle.sh
```

## 🤖 Discord 机器人

```bash
cd discord
cp .env.example .env
# 填入 DISCORD_TOKEN 和 QILING_API_KEY
npm install
npm start
```

支持指令：`/chat` `/train` `/delete_knowledge` `/version` `/stats` `/auto_train` `/help`

## 📖 API 文档

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/keys/register` | POST | 注册 API 密钥 |
| `/api/chat` | POST | 对话 |
| `/api/chat/stream` | POST | 流式对话 |
| `/api/train` | POST | 训练知识 |
| `/api/train/knowledge` | GET | 知识库列表 |
| `/api/train/auto` | POST | 触发自动训练 |
| `/api/feedback` | POST | 提交反馈 |
| `/api/version` | GET | 版本信息 |
| `/api/stats` | GET | 统计数据 |
| `/api/tools` | GET | 工具列表 |
| `/api/plugins` | GET | 插件列表 |

## 🗺️ 项目结构

```
qiling/
├── server/                 # 后端
│   ├── index.js           # 入口
│   ├── api/routes.js      # API 路由
│   ├── middleware/auth.js # 认证 & 限流
│   ├── db/database.js     # 数据库
│   └── brain/
│       ├── core/          # 核心引擎
│       ├── embeddings/    # 向量存储
│       ├── memory/        # 长期记忆
│       ├── tools/         # 工具调用
│       ├── plugins/       # 插件系统
│       ├── training/      # 自动训练
│       └── versioning/    # 版本管理
├── src/                   # 前端
│   ├── pages/             # 页面
│   ├── components/        # 组件
│   ├── context/           # React Context
│   └── styles/            # 样式
├── discord/               # Discord 机器人
├── public/                # 静态资源
├── Dockerfile
├── fly.toml
├── docker-compose.yml
└── package.json
```

## 🔑 定价

| 套餐 | 价格 | 速率 | 每日限额 |
|------|------|------|----------|
| 免费 | ¥0 | 1次/秒 | 20 条 |
| Pro | ¥29/月 | 5次/秒 | 500 条 |
| Ultra | ¥79/月 | 10次/秒 | 2000 条 |
| 企业 | ¥299/月 | 50次/秒 | 10000+ 条 |

## 🧪 技术栈

- **后端**: Node.js + Express + ESM
- **前端**: React + Vite + Tailwind CSS
- **数据库**: JSON 文件存储（零依赖，可升级 SQLite）
- **向量检索**: 内存向量索引 / sqlite-vec
- **模型推理**: llama.cpp / ONNX Runtime / 回退模式
- **AI 引擎**: 自研 RAG + 链式推理 + 自动训练闭环

## 📄 许可证

MIT © [MoRan3421](https://github.com/MoRan3421)

---

<p align="center">
  <strong>绮灵 QìLíng — 不是 AI，是你的伙伴 ✨</strong>
</p>
