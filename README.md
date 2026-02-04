
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

## 快速开始：使用 Eq 和 Ord 类型类

让我们从最简单的类型类开始，学习如何使用 `defun` 函数。

### 1. 从 Eq 开始

Eq（相等性）类型类用于定义类型的相等性比较。你只需要提供 `equal` 方法，`defun` 会自动为你派生 `notEqual` 方法。

```typescript
import { defun } from "defun"

// 定义 Eq 类型类
type EqMinimal<A> = {
    equal: (a: A, b: A) => boolean
}

const Eq = defun(<A>(minimal: EqMinimal<A>) => ({
    ...minimal,
    notEqual: (a: A, b: A) => !minimal.equal(a, b)
}))

// 创建 Number 类型的 Eq 实例
const NumberEq = Eq<number>({
    equal: (a, b) => a === b
})

// 使用
NumberEq.equal(1, 1) // true
NumberEq.notEqual(1, 2) // true
```

### 2. 进阶到 Ord

Ord（可比较）类型类扩展了 Eq，用于定义类型的大小比较。它依赖于 Eq 类型类。你只需要提供 `lte`（小于等于）或 `compare`（比较）方法，`defun` 会自动为你派生 `lt`、`gt`、`gte`、`max`、`min` 等方法。

```typescript
import { defun, type Dependencies } from "defun"

// 定义 Ord 类型类
type OrdMinimal<A> = {
    lte: (a: A, b: A) => boolean
}

export const Ord = defun(<A>(
    minimal: OrdMinimal<A> & Dependencies<{
            Eq: typeof Eq<A>
        }>
) => {
    const compare = "compare" in minimal ? minimal.compare : (a:A,b:A) => {
        if(lte(a,b)) return -1
        if(minimal.$deps.Eq.equal(a,b)) return 0
        return 1
    }
    const lte = "lte" in minimal ? minimal.lte : (a:A,b:A):boolean => {
        return compare(a,b) <= 0
    }
    const gt = (a:A,b:A) => {
        return compare(a,b) > 0
    }
    const gte = (a:A,b:A) => {
        return compare(a,b) >= 0
    }
    const lt = (a:A,b:A) => {
        return compare(a,b) < 0
    }
    const max = (x:A,...xs:A[]) => {
        return xs.reduce((a,b)=>{
            if(gt(a,b)) return a
            return b
        },x)
    }
    const min = (x:A,...xs:A[]) => {
        return xs.reduce((a,b)=>{
            if(lt(a,b)) return a
            return b
        },x)
    }
    return {
        gt,
        compare,
        gte,
        lte,
        lt,
        max,
        min
    }
})

// 创建 Number 类型的 Ord 实例
const NumberOrd = Ord<number>({
    lte: (a, b) => a <= b,
    $deps: { Eq: NumberEq }
})

// 使用
NumberOrd.lte(1, 2) // true
NumberOrd.gt(3, 2) // true
NumberOrd.max(1, 8, 4) // 8
NumberOrd.min(1, 8, 4) // 1
```

### 3. 函数式编程核心：Functor, Applicative, Monad

对于更高级的函数式编程概念，如 Functor（函子）、Applicative（应用函子）和 Monad（单子），请参考我们的专门文档：

- [Functor, Applicative, Monad 详解](./docs/Monad.md) - 从简单到复杂的完整指南
- [Binary 类型类](./docs/Binary.md) - 处理二进制序列化的类型类

---


## 安装

**注意：** 这是一个 TypeScript 专用包。使用前需要确保你的项目已经配置了 TypeScript 支持（TypeScript 5+ 版本）。

```bash
bun add defun
```
or
```bash
npm install defun

```

**在 `defun` 中，你定义的不是函数，而是逻辑的生长轨迹。**

