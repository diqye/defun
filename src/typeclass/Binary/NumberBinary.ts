import { Binary } from "../Binary"
import type { BinaryBuilder, BinaryReader } from "../Binary"

/**
 * Number 类型的 Binary instance（使用 Float64 存储），用于编码和解码数值
 */
export const NumberBinary = Binary({
    put: (builder: BinaryBuilder, value: number) => {
        builder.writeFloat64(value)
    },
    get: (reader: BinaryReader) => {
        return reader.readFloat64()
    }
})

/**
 * 无符号 8 位整数的 Binary instance，用于编码和解码 0-255 范围内的整数
 */
export const Uint8Binary = Binary({
    put: (builder: BinaryBuilder, value: number) => {
        builder.writeUint8(value)
    },
    get: (reader: BinaryReader) => {
        return reader.readUint8()
    }
})

/**
 * 有符号 8 位整数的 Binary instance，用于编码和解码 -128 到 127 范围内的整数
 */
export const Int8Binary = Binary({
    put: (builder: BinaryBuilder, value: number) => {
        builder.writeInt8(value)
    },
    get: (reader: BinaryReader) => {
        return reader.readInt8()
    }
})

/**
 * 无符号 16 位整数的 Binary instance，用于编码和解码 0-65535 范围内的整数（大端字节序）
 */
export const Uint16Binary = Binary({
    put: (builder: BinaryBuilder, value: number) => {
        builder.writeUint16(value)
    },
    get: (reader: BinaryReader) => {
        return reader.readUint16()
    }
})

/**
 * 有符号 16 位整数的 Binary instance，用于编码和解码 -32768 到 32767 范围内的整数（大端字节序）
 */
export const Int16Binary = Binary({
    put: (builder: BinaryBuilder, value: number) => {
        builder.writeInt16(value)
    },
    get: (reader: BinaryReader) => {
        return reader.readInt16()
    }
})

/**
 * 无符号 32 位整数的 Binary instance，用于编码和解码 0-4294967295 范围内的整数（大端字节序）
 */
export const Uint32Binary = Binary({
    put: (builder: BinaryBuilder, value: number) => {
        builder.writeUint32(value)
    },
    get: (reader: BinaryReader) => {
        return reader.readUint32()
    }
})

/**
 * 有符号 32 位整数的 Binary instance，用于编码和解码 -2147483648 到 2147483647 范围内的整数（大端字节序）
 */
export const Int32Binary = Binary({
    put: (builder: BinaryBuilder, value: number) => {
        builder.writeInt32(value)
    },
    get: (reader: BinaryReader) => {
        return reader.readInt32()
    }
})

/**
 * Float64 类型的 Binary instance（与 NumberBinary 相同），用于编码和解码双精度浮点数
 */
export const Float64Binary = NumberBinary
