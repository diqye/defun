import { Binary } from "../Binary"
import type { BinaryBuilder, BinaryReader } from "../Binary"

/**
 * Object类型的 Binary instance 工厂函数，需要传入类型安全的对象，包含字段名和对应的 Binary instance
 * 每个字段的类型会进行严格匹配，确保 Binary 实例与值类型匹配
 * 在 JavaScript 中，使用 for...of Object.entries() 遍历对象的顺序是确定的：
 * 1. 首先遍历所有的数字键，按照升序排列
 * 2. 然后遍历所有的字符串键，按照插入顺序排列
 * 3. 最后遍历所有的 Symbol 键，按照插入顺序排列
 * 我们只接受字符串键，所以遍历顺序是按照插入顺序排列的
 * @param pairs 对象，包含字段名和对应的 Binary instance
 * @returns 对象类型的 Binary instance
 */
export function ObjectBinary<T extends Record<string, any>>(pairs: { [K in keyof T]: ReturnType<typeof Binary<T[K]>> }) {
    return Binary<T>({
        put: (builder: BinaryBuilder, value: T): void => {
            // 使用 Object.entries 遍历对象，顺序是确定的
            for (const [key, binary] of Object.entries(pairs)) {
                binary.put(builder, value[key])
            }
        },
        get: (reader: BinaryReader): T => {
            const result: any = {}
            // 使用 Object.entries 遍历对象，顺序是确定的
            for (const [key, binary] of Object.entries(pairs)) {
                result[key] = binary.get(reader)
            }
            return result
        }
    })
}
