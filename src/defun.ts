
/**
 * HKT模拟
 */
export interface URItoKind<A=any> {}
export type Kind<URI extends keyof URItoKind,A> = URItoKind<A>[URI]

/**
 * 类型展开工具类型，对开发者友好
 */
export type Expand<A> = A extends Record<string,any> ? {
    [K in keyof A]: A[K]
} : never
/**
 * classtype 依赖标准写法工具类型
 */
export type Dependencies<T extends Record<string, (...args:any[])=>any >> = {
    $deps: {
        [key in keyof T]: ReturnType<T[key]>
    }
}

/**
 * 实现自执行函数
 * @param f 函数
 * @returns 
 */
export function callF<A>(f:()=>A):A {
    return f()
}


/**
 * 核心设计：基于最小核心集（Minimal Seed）自动派生全量函数集（Full API）。
 * * ### 设计原则 (Design Principles)
 * 1. **最小化实现 (Minimalism)**: 
 * 旨在减少冗余。开发者只需提供逻辑上不可或缺的“最小核心函数”，
 * 即可免费获得所有基于此核心推导出的辅助函数。
 * * 2. **类型驱动 (Type-Driven Trust)**: 
 * 深度依赖 TypeScript 的类型约束（如联合类型），不为规避 `as any` 而增加复杂度。
 * 我们假设类型检查通过即代表逻辑契约达成。
 * * 3. **静态组合 (Static Composition)**: 
 * `defaults` 生成的函数集与 `minimal` 静态绑定。
 * 4. **显式依赖 (Explicit Dependencies)**: 
 * 跨类型类的组合（如 Ord 依赖 Eq）必须通过 `$deps` 显式注入，不支持也不尝试模拟隐式全局实例。
 * 5. **闭包稳定性 (Closure Stability)**: 
 * 所有派生函数应避免使用 `this`，确保对象展开（Spread）后的逻辑一致性。
 * 6. **聚合优于拆分 (Cohesion over Shaking)**: 
 * 倾向于将相关功能聚合在一个实例对象中以提升开发体验，而非将每个函数独立导出。
 * 
 * 注意：`overwrites` 仅覆盖返回对象，不会改变派生函数内部引用的原逻辑。
 */
export function defun<Minimal,Full,M extends Minimal>(defaults:(mini: Minimal) => Full) {
    /**
     * dafd
     */
    return (minimal: M,overwrites?:Partial<Full>) =>  {
        return {
            ...defaults(minimal),
            ...overwrites
        } as Full
    }
}