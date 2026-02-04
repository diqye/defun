import { Binary } from "../Binary"
import type { BinaryBuilder, BinaryReader } from "../Binary"
import { BooleanBinary } from "./BooleanBinary"
import { StringBinary } from "./StringBinary"
import { NumberBinary } from "./NumberBinary"
import { Uint8ArrayBinary } from "./Uint8ArrayBinary"

// 支持的 JSON 类型外加 Uint8Array 类型
export type JSONValue =
  | null
  | boolean
  | number
  | string
  | JSONValue[]
  | { [key: string]: JSONValue }
  | Uint8Array

// 类型标记枚举
const TypeTag = {
    NULL: 0,
    BOOLEAN: 1,
    NUMBER: 2,
    STRING: 3,
    ARRAY: 4,
    OBJECT: 5,
    UINT8ARRAY: 6
} as const

/**
 * JSONValue 类型的 Binary instance，支持以下类型：
 * - null
 * - boolean
 * - number
 * - string
 * - array (包含支持的类型)
 * - object (包含支持的类型，key 只支持字符串)
 * - Uint8Array
 */
export const JSONBBinary = Binary<JSONValue>({
    put: (builder: BinaryBuilder, value: JSONValue): void => {
        // 根据值的类型写入类型标记
        if (value === null) {
            builder.writeUint8(TypeTag.NULL)
        } else if (typeof value === "boolean") {
            builder.writeUint8(TypeTag.BOOLEAN)
            BooleanBinary.put(builder, value)
        } else if (typeof value === "number") {
            builder.writeUint8(TypeTag.NUMBER)
            NumberBinary.put(builder, value)
        } else if (typeof value === "string") {
            builder.writeUint8(TypeTag.STRING)
            StringBinary.put(builder, value)
        } else if (Array.isArray(value)) {
            builder.writeUint8(TypeTag.ARRAY)
            // 写入数组长度
            builder.writeUint32(value.length)
            // 逐个写入数组元素
            for (const item of value) {
                JSONBBinary.put(builder, item)
            }
        } else if (typeof value === "object" && value instanceof Uint8Array) {
            builder.writeUint8(TypeTag.UINT8ARRAY)
            Uint8ArrayBinary.put(builder, value)
        } else if (typeof value === "object" && value !== null) {
            builder.writeUint8(TypeTag.OBJECT)
            // 转换为键值对数组
            const entries = Object.entries(value)
            // 写入对象属性数量
            builder.writeUint32(entries.length)
            // 逐个写入属性
            for (const [key, val] of entries) {
                StringBinary.put(builder, key)
                JSONBBinary.put(builder, val)
            }
        } else {
            throw new Error(`Unsupported type: ${typeof value}`)
        }
    },
    get: (reader: BinaryReader): JSONValue => {
        // 读取类型标记
        const typeTag = reader.readUint8()

        switch (typeTag) {
            case TypeTag.NULL:
                return null
            case TypeTag.BOOLEAN:
                return BooleanBinary.get(reader)
            case TypeTag.NUMBER:
                return NumberBinary.get(reader)
            case TypeTag.STRING:
                return StringBinary.get(reader)
            case TypeTag.ARRAY:
                // 读取数组长度
                const length = reader.readUint32()
                // 逐个读取数组元素
                const array: JSONValue[] = []
                for (let i = 0; i < length; i++) {
                    array.push(JSONBBinary.get(reader))
                }
                return array
            case TypeTag.UINT8ARRAY:
                return Uint8ArrayBinary.get(reader)
            case TypeTag.OBJECT:
                // 读取对象属性数量
                const count = reader.readUint32()
                // 逐个读取属性
                const obj: { [key: string]: JSONValue } = {}
                for (let i = 0; i < count; i++) {
                    const key = StringBinary.get(reader)
                    const value = JSONBBinary.get(reader)
                    obj[key] = value
                }
                return obj
            default:
                throw new Error(`Unknown type tag: ${typeTag}`)
        }
    }
})
