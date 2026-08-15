# Security Policy

## 报告漏洞 / Reporting a vulnerability

请使用 GitHub 私有漏洞报告（Private Vulnerability Reporting）提交，不要公开 issue：

- **提交入口**：<https://github.com/PerryLink/dsh-output-styles/security/advisories/new>

### 报告前请先脱敏

- 删除日志与复现样例中的真实 token、密钥、Cookie、Authorization 请求头和个人路径；无法删除的部分用 `REDACTED` 占位。
- 提供最小复现步骤与受影响版本（包版本 + DeepSeek Harness 版本）。
- 报告内容不会被公开展示；请勿在公开 issue 中粘贴任何凭据。

### 响应预期

- 确认收到：**5 个工作日内**
- 修复发布：按严重程度尽快处理；严重漏洞会尽快发布补丁版本并在 CHANGELOG 中标注。

### 致谢与披露

- 修复发布后，经报告者同意，在 release notes / CHANGELOG 中致谢。
- 公开披露不早于修复版本发布；严重漏洞遵循协调披露（coordinated disclosure）。
- 未脱敏的日志与密钥材料不会被存储或引用。

## 支持版本 / Supported versions

| 版本 | 支持状态 |
|---|---|
| 0.3.x | ✅ 当前支持 |
| < 0.3.0 | ❌ 不再支持 |
