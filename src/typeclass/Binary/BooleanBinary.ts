import { Binary } from "../Binary"
import type { BinaryBuilder, BinaryReader } from "../Binary"

/**
 * Boolean 类型的 Binary instance，用于编码和解码布尔值
 */
export const BooleanBinary = Binary({
    put: (builder: BinaryBuilder, value: boolean) => {
        builder.writeBoolean(value)
    },
    get: (reader: BinaryReader) => {
        return reader.readBoolean()
    }
})

/**
 * 8个布尔值组成的元组类型，占用一个字节存储
 */
export type Tuple8 = readonly [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean]

/**
 * Tuple8 类型的 Binary instance，将8个布尔值打包成一个字节存储
 * 1. 11111111 对应 8个 true
 * 2. 位置和看到的一致前后一一对应
 */
export const Tuple8BooleanBinary = Binary<Tuple8>({
    put: function (builder: BinaryBuilder, value: Tuple8): void {
        let byte = 0
        for (let i = 0; i < 8; i++) {
            if (value[i]) {
                byte |= (1 << (7 - i))
            }
        }
        builder.writeUint8(byte)
    },
    get: function (reader: BinaryReader): Tuple8 {
        const byte = reader.readUint8()
        const out: Tuple8 = [
            ((byte >> 7) & 1) === 1,
            ((byte >> 6) & 1) === 1,
            ((byte >> 5) & 1) === 1,
            ((byte >> 4) & 1) === 1,
            ((byte >> 3) & 1) === 1,
            ((byte >> 2) & 1) === 1,
            ((byte >> 1) & 1) === 1,
            ((byte >> 0) & 1) === 1
        ]
        return out
    }
})
