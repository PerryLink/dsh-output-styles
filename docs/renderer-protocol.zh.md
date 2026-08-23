# output.render.* —— dsh-output-styles 渲染器协议

> English version: [renderer-protocol.md](renderer-protocol.md)。`/style` 切换行为完全兼容；
> 本文档只覆盖 0.4.0 新增的呈现层。

渲染器协议把输出呈现变成扩展点：任何插件都可以注册一个**渲染器**——把原始模型可见文本
映射为展示文本的纯函数——本插件面向外部的表面（`/export`、`ctx.outputRenderers.renderText`
服务）统一经一条可审计的流水线应用它们。

## 渲染器契约

```ts
interface OutputRenderer {
  id: string                 // kebab-case，注册表内唯一
  name: string               // 人类可读名称
  description: string        // 一句话说明
  match: RendererMatch[]     // [] = 匹配一切
  priority: number           // 数值越大越优先；平局按注册顺序
  presenter: (text: string, context: RenderContext) => string  // 纯函数——无 DOM、无 I/O
}

interface RendererMatch {
  tool?: string | string[]           // 工具名；'*' = 任意；缺省 = 任意
  contentType?: 'text' | 'markdown' | 'html' | ContentType[]
}

interface RenderContext {
  tool: string               // assistant/user 散文为 ''
  contentType: ContentType
  sessionId?: string
  meta?: Record<string, string>
}
```

注册表强制执行的规则（失败大声）：

- 非法渲染器（id 语法错、缺字段、presenter 非函数、priority 非有限数）在注册时抛错，
  绝不进入注册表。
- id 重复抛错；`register()` 返回 disposer，精确移除本次注册——可逆性由调用方的
  `ctx.effect` 负责。

## 渲染流水线

```text
renderText(text, context)
  → output.render/before waterfall   （监听器转换 {text, context}，必须 next()）
  → 规则表（按优先级取第一条命中）
      ├─ 规则命中 → 只应用该规则指定的渲染器（显式，其余渲染器不参与）
      └─ 未命中   → 按优先级依次应用所有匹配的渲染器（组合）
  → { original, rendered, rendererId?, changed }
```

- waterfall 监听器契约就是普通 Cordis waterfall 语义：不调用 `next()` 就返回会短路整条
  流水线——只在有意为之的时候这样做。
- 规则指向未注册渲染器时在渲染期响亮失败（注册表在运行期可增删渲染器；静默回退会掩盖漂移）。

## 内置渲染器

| id | 行为 |
| --- | --- |
| `concise` | 折叠空白串与空行堆，在预算处截断并加 `[truncated]` 标记。 |
| `step-by-step` | 把列表项（短横线、圆点或数字）统一从 1 重新编号；散文保持原样。 |

两个 id 与两大招牌风格同名，因此规则
`{ match: { tool: 'bash' }, style: 'concise' }` 读起来很自然。

## 按会话 / 按工具规则

```yaml
# cordis.yml，dsh-output-styles 行的 config 下
config:
  rules:
    - match: { tool: bash }
      style: concise
    - match: { tool: read, contentType: text }
      style: step-by-step
      priority: 5
    - match: { session: "session-id-here" }
      style: step-by-step
```

匹配是精确匹配（除 `'*'` 表示任意工具外没有通配符）；`match.session` 把规则限定在一个会话。
规则也可以在设置页编辑（`output-style-rules` 命名空间），同一形状在写入时校验。

## 可审计性

呈现绝不销毁来源：

- 每个结果对象在 `rendered` 旁边携带 `original`；
- 导出会话的原始文本就是会话日志本身——`/export` 经官方 `deriveEventMessage` surface
  规则投影它，与 harness 构建模型请求用的是同一条规则；
- 渲染应用是确定性的（同样的规则 + 同样顺序的渲染器），因此渲染输出与其来源总是一起重建。

## 第三方示例（完整）

```ts
// my-plugin/renderers.ts
export const tableCompactor = {
  id: 'sql-table',
  name: 'SQL table compactor',
  description: 'Truncates oversized SQL result sets to the head plus a row count.',
  match: [{ tool: 'sql', contentType: 'text' }],
  priority: 20,
  presenter: (text: string): string => {
    const rows = text.split('\n')
    if (rows.length <= 50) return text
    return [...rows.slice(0, 50), `… ${rows.length - 50} more rows`].join('\n')
  },
}

// my-plugin/index.ts
export function apply(ctx: Context): void {
  const renderers = ctx.get('outputRenderers')   // 可选依赖：dsh-output-styles 可能未挂载
  if (renderers !== undefined) {
    ctx.effect(() => renderers.register(tableCompactor))
  }
}
```

## 消费流水线

```ts
const result = await ctx.outputRenderers.renderText(rawText, { tool: 'sql', contentType: 'text' })
// { original, rendered, rendererId, changed } —— 在任何展示它的地方把两半都记下来。
```

## 导出到磁盘

`/export` 把渲染后的文档作为命令输出文本返回。`/export [md|markdown|html]
[--renderer=<id>] --save <path>` 另外把文档写入工作区路径：文档先经 `sanitizeText`
纯函数净化，随后写入由审批服务（`ctx.get('approval')`，缺失则 fail-closed）把关、由
fs 服务（`ctx.get('fs')`，缺失则大声失败）执行。渲染流水线本身不变——两种输出之前都应用
同样的 presenter 与规则表。
