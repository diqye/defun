import { Binary } from "../Binary"
import type { BinaryBuilder, BinaryReader } from "../Binary"

/**
 * String 类型的 Binary instance，用于编码和解码字符串（UTF-8 编码）
 */
export const StringBinary = Binary({
    put: (builder: BinaryBuilder, value: string) => {
        builder.writeString(value)
    },
    get: (reader: BinaryReader) => {
        return reader.readString()
    }
})
