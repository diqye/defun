import { Binary } from "../Binary"
import type { BinaryBuilder, BinaryReader } from "../Binary"

/**
 * 数组类型的 Binary instance 工厂函数，需要传入元素类型的 Binary instance
 * @param elementBinary 数组元素类型的 Binary instance
 * @returns 数组类型的 Binary instance
 */
export function ListBinary<A>(elementBinary: ReturnType<typeof Binary<A>>) {
    return Binary({
        put: (builder: BinaryBuilder, value: A[]) => {
            // 先写入数组长度（Uint32）
            builder.writeUint32(value.length)
            // 逐个写入数组元素
            for (const item of value) {
                elementBinary.put(builder, item)
            }
        },
        get: (reader: BinaryReader) => {
            // 先读取数组长度
            const length = reader.readUint32()
            // 逐个读取数组元素
            const result: A[] = []
            for (let i = 0; i < length; i++) {
                result.push(elementBinary.get(reader))
            }
            return result
        }
    })
}
