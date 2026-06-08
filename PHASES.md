# 绮灵 QiLing — 四阶段开发路线

## Phase 1 · 绮灵初醒 `v1.0.0` ✅

**目标：** 可用的自研 AI 对话系统

- [x] 绮灵 Brain 推理引擎（TF-IDF RAG + 链式推理）
- [x] React JSX 聊天界面 + 可爱模式
- [x] API Key 注册（免费 / Pro）
- [x] 训练中心 + 反馈学习
- [x] SSE 流式回复
- [x] 本地持久化（brain.json + SQLite）

---

## Phase 2 · 灵络扩展 `v2.1.0` 🔄 当前

**目标：** 生产级 API + 多平台接入 + 完整产品体验

- [x] 令牌桶速率限制（秒/分/日 + 分钟级恢复）
- [x] 免费版：每 4 分钟恢复 1 次，每 60 分钟恢复 5 条日额度
- [x] 永久 Pro / Ultra API Key
- [x] QueryEngine 资料查询（百科/FAQ/知识库）
- [x] Discord 机器人（/chat /query /train /status）
- [x] 精美主页 + 登录页（含 AI 介绍）
- [x] 正在输入中动画
- [x] 8+ 功能模块自由开关
- [x] React Router 多页面路由
- [x] 速率监控 UI
- [x] 四阶段版本 API (`/api/version`)
- [x] Fly.io / Render / Vercel 部署配置

---

## Phase 3 · 星识觉醒 `v3.0.0` 📋 计划

**目标：** 更强的智能和扩展能力

- [ ] 联网实时搜索（可配置搜索 API，Key 由用户自填）
- [ ] 多模态：图片理解、语音输入
- [ ] 插件系统（天气、翻译、计算器等）
- [ ] 团队共享知识库
- [ ] Webhook 事件通知
- [ ] 对话导出 / 分析面板

---

## Phase 4 · 绮灵天成 `v4.0.0` 📋 计划

**目标：** 企业级全栈 AI 平台

- [ ] 分布式 Brain 集群（多节点负载均衡）
- [ ] Stripe / 微信支付真实订阅
- [ ] 自托管大模型接入（Ollama / vLLM）
- [ ] 企业 SLA + 专属实例
- [ ] 管理后台 Dashboard
- [ ] 审计日志 + 合规导出

---

## 版本对照

| 版本 | Phase | 发布状态 |
|------|-------|----------|
| v1.0.0 | Phase 1 | ✅ Released |
| v2.0.0 | Phase 2 | 🔄 Current |
| v3.0.0 | Phase 3 | 📋 Planned |
| v4.0.0 | Phase 4 | 📋 Planned |
