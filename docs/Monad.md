# Functor, Applicative, Monad 详解

本文将从简单的应用场景开始，逐步引入 Functor（函子）、Applicative（应用函子）和 Monad（单子）这三个核心概念。我们将重点介绍它们的实际应用，并展示如何在 TypeScript 中使用我们的类型系统来实现这些概念。

## 1. 简单的函数式编程问题

### 1.1 基本场景：处理可能为空的值

假设我们有一个简单的需求：计算一个字符串的长度，但字符串可能是空的。

传统的方法可能是这样的：
```typescript
function getLength(str: string | null | undefined): number {
  if (str == null) {
    return 0;
  }
  return str.length;
}
```

这种方法简单直接，但随着业务逻辑变得复杂，我们需要处理的边界情况会越来越多，代码也会变得难以维护。

### 1.2 改进方案：使用容器类型

我们可以使用一个简单的容器类型来封装可能为空的值：
```typescript
type Maybe<T> = Some<T> | None;

interface Some<T> {
  type: 'some';
  value: T;
}

interface None {
  type: 'none';
}

function some<T>(value: T): Some<T> {
  return { type: 'some', value };
}

function none(): None {
  return { type: 'none' };
}
```

有了这个容器类型，我们可以重写 `getLength` 函数：
```typescript
function getLength(str: string | null | undefined): number {
  const maybeStr = str == null ? none() : some(str);
  if (maybeStr.type === 'some') {
    return maybeStr.value.length;
  }
  return 0;
}
```

虽然代码看起来更复杂了，但我们已经将值的上下文（可能为空）与对值的操作分离了开来。

## 2. Functor（函子）：处理容器内的值

### 2.1 问题：对容器内的值进行变换

现在，我们希望对 `Maybe` 容器内的值进行变换，但不想破坏容器的结构。例如，我们想将字符串转换为大写，或者计算字符串的长度。

我们可以为 `Maybe` 类型添加一个 `map` 方法：
```typescript
type Maybe<T> = Some<T> | None;

interface Some<T> {
  type: 'some';
  value: T;
  map<U>(f: (value: T) => U): Maybe<U>;
}

interface None {
  type: 'none';
  map<U>(f: (value: any) => U): Maybe<U>;
}

function some<T>(value: T): Some<T> {
  return {
    type: 'some',
    value,
    map: function<U>(f: (value: T) => U): Maybe<U> {
      return some(f(this.value));
    }
  };
}

function none(): None {
  return {
    type: 'none',
    map: function<U>(f: (value: any) => U): Maybe<U> {
      return this;
    }
  };
}
```

现在我们可以这样使用：
```typescript
const str1 = some("hello");
const str2 = none();

const upperStr1 = str1.map(s => s.toUpperCase()); // some("HELLO")
const upperStr2 = str2.map(s => s.toUpperCase()); // none()

const length1 = str1.map(s => s.length); // some(5)
const length2 = str2.map(s => s.length); // none()
```

### 2.2 Functor 抽象

`Maybe` 类型现在已经是一个 Functor 了。Functor 是一个包含值的容器类型，它支持 `map` 方法，可以对容器内的值进行变换而不改变容器的结构。

在我们的类型系统中，Functor 定义如下：
```typescript
interface FunctorMinimal<URI extends URIs> {
  fmap: <A, B>(f: (a: A) => B, fa: Kind<URI, A>) => Kind<URI, B>
}

// 例如 ListFunctor
export const ListFunctor = Functor<"list">({
    fmap: function <A, B>(f: (a: A) => B, fa: A[]): B[] {
        return fa.map(f)
    }
})

// 使用
const numbers = [1, 2, 3];
const doubled = ListFunctor.fmap(x => x * 2, numbers); // [2, 4, 6]
```

## 3. Applicative（应用函子）：处理容器内的函数

### 3.1 问题：将容器内的函数应用到容器内的值

有时候，我们会遇到这样的情况：函数本身也在容器中。例如，我们有一个 `Maybe<(a: number) => number>` 类型的函数，我们想将它应用到一个 `Maybe<number>` 类型的值上。

对于这种情况，我们需要引入 Applicative（应用函子）的概念。Applicative 支持 `pure` 方法（将值包装到容器中）和 `liftA2` 方法（将二元函数提升到容器级别）。

我们可以为 `Maybe` 类型添加这些方法：
```typescript
interface Some<T> {
  type: 'some';
  value: T;
  map<U>(f: (value: T) => U): Maybe<U>;
  ap<U>(fab: Maybe<(a: T) => U>): Maybe<U>;
}

interface None {
  type: 'none';
  map<U>(f: (value: any) => U): Maybe<U>;
  ap<U>(fab: Maybe<(a: any) => U>): Maybe<U>;
}

function some<T>(value: T): Some<T> {
  return {
    type: 'some',
    value,
    map: function<U>(f: (value: T) => U): Maybe<U> {
      return some(f(this.value));
    },
    ap: function<U>(fab: Maybe<(a: T) => U>): Maybe<U> {
      if (fab.type === 'some') {
        return some(fab.value(this.value));
      }
      return none();
    }
  };
}

function none(): None {
  return {
    type: 'none',
    map: function<U>(f: (value: any) => U): Maybe<U> {
      return this;
    },
    ap: function<U>(fab: Maybe<(a: any) => U>): Maybe<U> {
      return this;
    }
  };
}

function pure<T>(value: T): Maybe<T> {
  return some(value);
}

function liftA2<A, B, C>(
  f: (a: A, b: B) => C,
  fa: Maybe<A>,
  fb: Maybe<B>
): Maybe<C> {
  return fa.map(f).ap(fb);
}
```

现在我们可以这样使用：
```typescript
const maybeAdd = pure((a: number) => (b: number) => a + b);
const maybe5 = pure(5);
const maybe3 = pure(3);

const result = maybeAdd.ap(maybe5).ap(maybe3); // some(8)

// 使用 liftA2 更简洁
const result2 = liftA2((a, b) => a + b, maybe5, maybe3); // some(8)
```

### 3.2 Applicative 抽象

在我们的类型系统中，Applicative 定义如下：
```typescript
interface ApplicativeMinimal<URI extends URIs> {
  pure: <A>(a: A) => Kind<URI, A>
  liftA2: <A, B, C>(f: (a: A, b: B) => C, fa: Kind<URI, A>, fb: Kind<URI, B>) => Kind<URI, C>
}

// 例如 ListApplicative
export const ListApplicative = Applicative<"list">({
    pure: function <A>(a: A): A[] {
        return [a]
    },
    liftA2: <A, B, C>(f: (a: A, b: B) => C, fa: A[], fb: B[]): C[] => {
        let cs = [] as C[]
        for(const [key,a] of fa.entries()) {
            if(key >= fb.length) break
            cs.push(f(a,fb[key]!))
        }
        return cs
    },
    $deps: {
        Functor: ListFunctor
    }
})

// 使用
const add = (a: number, b: number) => a + b;
const numbers1 = [1, 2];
const numbers2 = [3, 4];
const result = ListApplicative.liftA2(add, numbers1, numbers2); // [4, 6]
```

## 4. Monad（单子）：处理依赖于前一个结果的计算

### 4.1 问题：连接多个依赖的操作

假设我们有一个获取用户信息的函数：
```typescript
function getUser(id: number): Maybe<User> {
  // 返回用户信息或 none()
}

function getOrders(user: User): Maybe<Order[]> {
  // 返回用户订单或 none()
}
```

现在我们想获取特定用户的订单。我们可以使用 Functor 的 `map` 方法：
```typescript
const userOrders = getUser(123).map(getOrders); // Maybe<Maybe<Order[]>>
```

但这样会得到一个嵌套的 `Maybe` 类型，我们需要多次检查是否为 `none()`：
```typescript
if (userOrders.type === 'some') {
  const orders = userOrders.value;
  if (orders.type === 'some') {
    // 处理订单
  }
}
```

### 4.2 解决方案：Monad 的 `bind` 操作

Monad 引入了 `bind` 操作（通常也称为 `flatMap` 或 `chain`），它可以将嵌套的容器扁平化为一个单一的容器。

我们可以为 `Maybe` 类型添加 `bind` 方法：
```typescript
interface Some<T> {
  type: 'some';
  value: T;
  map<U>(f: (value: T) => U): Maybe<U>;
  ap<U>(fab: Maybe<(a: T) => U>): Maybe<U>;
  bind<U>(f: (value: T) => Maybe<U>): Maybe<U>;
}

interface None {
  type: 'none';
  map<U>(f: (value: any) => U): Maybe<U>;
  ap<U>(fab: Maybe<(a: any) => U>): Maybe<U>;
  bind<U>(f: (value: any) => Maybe<U>): Maybe<U>;
}

function some<T>(value: T): Some<T> {
  return {
    type: 'some',
    value,
    map: function<U>(f: (value: T) => U): Maybe<U> {
      return some(f(this.value));
    },
    ap: function<U>(fab: Maybe<(a: T) => U>): Maybe<U> {
      if (fab.type === 'some') {
        return some(fab.value(this.value));
      }
      return none();
    },
    bind: function<U>(f: (value: T) => Maybe<U>): Maybe<U> {
      return f(this.value);
    }
  };
}

function none(): None {
  return {
    type: 'none',
    map: function<U>(f: (value: any) => U): Maybe<U> {
      return this;
    },
    ap: function<U>(fab: Maybe<(a: any) => U>): Maybe<U> {
      return this;
    },
    bind: function<U>(f: (value: any) => Maybe<U>): Maybe<U> {
      return this;
    }
  };
}
```

现在我们可以这样使用：
```typescript
const userOrders = getUser(123).bind(getOrders); // Maybe<Order[]>

// 现在只需要检查一次
if (userOrders.type === 'some') {
  // 处理订单
}
```

### 4.3 Monad 抽象

在我们的类型系统中，Monad 定义如下：
```typescript
interface MonadMinimal<URI extends URIs> {
    bind: <A,B>(ma:Kind<URI,A>,f:(a:A)=>Kind<URI,B>) => Kind<URI,B>
}

// 例如 ListMonad
export const ListMonad = Monad<"list">({
    bind: function <A, B>(ma: A[], f: (a: A) => B[]): B[] {
        return ma.map(a=>{
            return f(a)
        }).reduce((xs,x)=>xs.concat(x),[])
    },
    $deps: {
        Applicative: ListApplicative
    }
})

// 使用
const numbers = [1, 2, 3];
const result = ListMonad.bind(numbers, x => [x, x * 2]); // [1, 2, 2, 4, 3, 6]
```

## 5. 在我们的类型系统中的实现方式

### 5.1 单类型参数的 Monad（如 ListMonad）

对于只有一个类型参数的 Monad，我们推荐使用 `M` 类：
```typescript
// 使用 ListMonad
const value = M.from(ListMonad, new Array(10).fill(0))
  .semiBind([1,2,3]).value(); // [1, 2, 3, 1, 2, 3, ...] (30个元素)

// 使用 bind 操作
const pairs = M.from(ListMonad, [1, 2, 3])
  .bind(a => M.from(ListMonad, [1, 2, 3])
  .bind(b => {
    if (a * b === 6) return [[a, b]];
    return [];
  })).value(); // [[2, 3], [3, 2]]
```

### 5.2 多类型参数的 Monad（如 FunctionMonad）

对于有两个或三个类型参数的 Monad，我们推荐使用专门的类来封装（如 FunctionMonad 中的 FM 类）：
```typescript
export class FM<P,R> {
    f: (p:P) => R
    static readonly fm = FunctionMonad

    private constructor(f: typeof this.f){
        this.f = f
    }

    public static from<P,R>(f: FM<P,R>["f"]) {
        return new this(f)
    }

    public static fromPure<P,R>(a:R,p?:P) {
        return FM.from(
            this.fm.pure(a,p)
        )
    }

    public run(p:P) {
        return this.f(p)
    }

    // 其他方法...
}

// 使用
const fm = FM.from<string, number>(text => text.length)
  .fmap(len => len * 2)
  .bind(len => FM.fromPure<string, string>(`Double length: ${len}`))
  .fmap(str => str.toUpperCase());

fm.run("hello"); // "DOUBLE LENGTH: 10"
```

这种方式提供了更清晰的 API 和更好的类型安全。

## 6. 总结

- **Functor**：处理容器内的值变换（map）
- **Applicative**：处理容器内的函数应用（pure, liftA2）
- **Monad**：处理依赖于前一个结果的计算（bind）

这些概念提供了一种统一的方式来处理各种计算上下文，如可能为空的值、错误处理、异步操作、状态管理等。

在我们的类型系统中，：
- 对于单类型参数的 Monad，使用 `M` 类
- 对于多类型参数的 Monad，使用专门封装的类（如 FM）

这样可以在保持类型安全的同时，提供清晰的 API 供开发者使用。

## 7. 本库提供的 API 介绍

### 7.1 核心类型类

#### Functor 相关
- `Functor`: 单类型参数的函子类型类
- `Functor2`: 双类型参数的函子类型类
- `Functor3`: 三类型参数的函子类型类
- `ListFunctor`: 列表类型的 Functor 实现
- `EitherFunctor`: Either 类型的 Functor 实现
- `FunctionFunctor`: 函数类型的 Functor 实现
- `TupleFunctor`: 元组类型的 Functor 实现

#### Applicative 相关
- `Applicative`: 单类型参数的应用函子类型类
- `Applicative2`: 双类型参数的应用函子类型类
- `Applicative3`: 三类型参数的应用函子类型类
- `ListApplicative`: 列表类型的 Applicative 实现
- `EitherApplicative`: Either 类型的 Applicative 实现
- `FunctionApplicative`: 函数类型的 Applicative 实现

#### Monad 相关
- `Monad`: 单类型参数的单子类型类
- `Monad2`: 双类型参数的单子类型类
- `Monad3`: 三类型参数的单子类型类
- `ListMonad`: 列表类型的 Monad 实现
- `FunctionMonad`: 函数类型的 Monad 实现（Reader Monad）

### 7.2 主要类和方法

#### M 类（单类型参数 Monad 包装类）
```typescript
// 构造方法
static from<URI, T>(monad: ReturnType<typeof Monad<URI>>, ctx: Kind<URI, T>): M<URI, T>
static fromPure<URI, T>(monad: ReturnType<typeof Monad<URI>>, a: T): M<URI, T>

// 实例方法
value(): Kind<URI, T>
pure<X>(a: X): M<URI, X>
bind<X>(f: (a: T) => Kind<URI, X> | M<URI, X>): M<URI, X>
semiBind<X>(fb: Kind<URI, X> | M<URI, X>): M<URI, X>
fmap<B>(f: (a: T) => B): M<URI, B>
replaceBy<B>(b: B): M<URI, B>
```

#### FM 类（函数 Monad 专门包装类）
```typescript
// 构造方法
static from<P, R>(f: (p: P) => R): FM<P, R>
static fromPure<P, R>(a: R, p?: P): FM<P, R>
static empty<P>(ptype?: P): FM<P, undefined>

// 实例方法
run(p: P): R
value(): (p: P) => R
bind<R2>(ffm: (a: R) => FM<P, R2>): FM<P, R2>
semiBind<R2>(fm: FM<P, R2>): FM<P, R2>
fmap<R2>(f: (a: R) => R2): FM<P, R2>
replaceby<R2>(r2: R2): FM<P, R2>
ask<R2>(ffm: (a: P) => FM<P, R2>): FM<P, R2>
```

### 7.3 基础类型和工具

#### URItoKind 接口
```typescript
interface URItoKind<A=any> {
    list: A[];
    // 其他类型...
}

interface URItoKind2<A=any, B=any> {
    either: Either<A, B>;
    function: (a: A) => B;
    // 其他类型...
}

interface URItoKind3<A=any, B=any, C=any> {
    // 三类型参数类型...
}
```

#### Kind 类型别名
```typescript
type Kind<URI extends keyof URItoKind, A> = URItoKind<A>[URI]
type Kind2<URI extends keyof URItoKind2, A, B> = URItoKind2<A, B>[URI]
type Kind3<URI extends keyof URItoKind3, A, B, C> = URItoKind3<A, B, C>[URI]
```

#### 其他工具类型和函数
```typescript
type Expand<A> = /* 类型展开工具 */
type Dependencies<T> = /* 依赖管理工具 */
function callF<A>(f: () => A): A /* 自执行函数 */
function defun<Minimal, Full, M extends Minimal>(defaults: (mini: Minimal) => Full): /* 类型类定义工具 */
```

### 7.4 使用示例

#### ListMonad 使用
```typescript
import { M, ListMonad } from "defun"

const result = M.from(ListMonad, [1, 2, 3])
    .bind(a => M.from(ListMonad, [a * 2, a * 3]))
    .value() // [2, 3, 4, 6, 6, 9]
```

#### FunctionMonad 使用
```typescript
import { FM } from "defun"

const result = FM.from<string, number>(text => text.length)
    .fmap(len => len * 2)
    .bind(len => FM.fromPure<string, string>(`Length: ${len}`))
    .run("hello") // "Length: 10"
```

### 7.5 项目入口
所有类型和类型类都可以通过主入口点导入：
```typescript
import {
    M, M2, M3, // 包装类
    ListMonad, FunctionMonad, // 单子实现
    ListApplicative, FunctionApplicative, // 应用函子实现
    ListFunctor, FunctionFunctor, // 函子实现
    FM, // 函数 Monad 专门类
    URItoKind, Kind, // 类型工具
    defun // 类型类定义工具
} from "defun"
```

本库提供了一套完整的函数式编程类型系统，允许开发者以类型安全的方式使用 Functor、Applicative 和 Monad 等函数式编程概念。通过使用包装类（如 M 和 FM），开发者可以获得清晰的 API 同时保持代码的可维护性和可扩展性。
