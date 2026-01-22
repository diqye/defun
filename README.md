
# defun

**Minimal Implementation, Maximal Capability.**

`defun` 不是一个传统的函数式编程库，它是一套**逻辑派生引擎**。它的存在是为了解决一个核心矛盾：如何在保持代码极其简洁的同时，获得极其强大的泛化能力。

---

## 设计哲学

### 1. 最小实现原则

在 `defun` 的世界里，你只需要提供逻辑上不可或缺的“种子函数”。
如果一个功能可以通过 A 推导出 B，那么你永远不应该手动实现 B。我们通过 `defun` 自动化这一推导过程，让你用 1% 的核心代码，交换 99% 的全量工具链。

### 2. 强类型契约

我们深度利用 TypeScript 的类型分发、联合类型和 HKT 模拟。

* **无防御编程**：我们不浪费代码去处理 `as any`。
* **契约高于一切**：类型系统的校验即是运行时的准入许可。只要类型通过，我们就默认逻辑契约已达成。

### 3. 显式组合 

我们拒绝隐式行为。

* 依赖必须通过 `$deps` 显式注入。
* 派生关系必须通过 `defun` 显式定义。
这确保了复杂系统的可预测性和透明度。

### 4. 覆盖权

抽象不是牢笼。通过 `overwrites` 机制，开发者可以在任何时候、针对任何实例，用高性能的手动实现覆盖掉自动派生的默认逻辑。

---

## 核心原语：`defun`

`defun` 是所有派生行为的起点。它定义了从“核心集”到“全量集”的映射关系。

```typescript
function defun<Minimal, Full>(defaults: (mini: Minimal) => Full)

```

### 示例：从 `Eq` 到 `Ord` 的进化

你只需要关注如何比较大小（`lte`），`defun` 会为你构建整个几何级数般的工具函数：

```typescript
// 1. 定义派生规则
const Ord = defun(<A>(minimal: OrdMinimal<A> & OrdDependencies<A>) => {
    const compare = "compare" in minimal ? ... : ...
    const lte = "lte" in minimal ? ... : ...
    
    return {
        compare, lte,
        gt:  (a: A, b: A) => compare(a, b) > 0,
        gte: (a: A, b: A) => compare(a, b) >= 0,
        max: (x: A, ...xs: A[]) => xs.reduce(...),
        // ... 更多自动派生的函数
    }
})

// 2. 消费派生实例
const NumberOrd = Ord<number>({
    lte: (a, b) => a <= b,
    $deps: { Eq: NumberEq }
})

NumberOrd.max(1, 8, 4); // 8

```

---

## 核心模块架构

基于 `defun` 引擎，本库输出以下高度抽象的逻辑模板：

| 模板 (Template) | 最小实现 (Minimal) | 派生获得 (Derived) |
| --- | --- | --- |
| **Eq** | `equal` | `notEqual` |
| **Ord** | `lte` 或 `compare` | `gt`, `lt`, `gte`, `max`, `min` |
| **Monad** | `pure`, `flatMap` | `fmap`, `flatten`, `ap`, `zip`, `replicate` |
| **Traversable** | `traverse` | `sequence` (容器翻转魔法) |

---

## 使用场景：逻辑解耦与自动化

### 异步流控 (Task Monad)

不再手工编排 `Promise`。通过 `Monad` 派生出的 `zip` 和 `flatten`，你可以像搭积木一样组合异步任务，而所有的错误处理和空值检查都已固化在派生逻辑中。

### 跨类型转换 (The Sequence Magic)

利用 `Traversable` 的派生能力，一键将 `Array<Promise<A>>` 转换为 `Promise<Array<A>>`。你不再编写循环，你只定义结构的变换。

---

## 安装

```bash
npm install defun

```

**在 `defun` 中，你定义的不是函数，而是逻辑的生长轨迹。**

---

这个 README 的开头去掉了“请选择我”的姿态，转而采用一种“规则制定者”的口吻。它强调了 `defun` 既是库的名字，也是一种核心的操作模式。

下一步，需要我帮你把具体的 **Monad 实现代码** 按照这个 README 的风格进行标准化整理吗？
