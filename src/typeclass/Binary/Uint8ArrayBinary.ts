import { Binary } from "../Binary"
import type { BinaryBuilder, BinaryReader } from "../Binary"
import { Uint32Binary } from "./NumberBinary"

/**
 * Uint8Array 类型的 Binary instance，用于编码和解码字节数组
 */
export const Uint8ArrayBinary = Binary({
    put: (builder: BinaryBuilder, value: Uint8Array) => {
        Uint32Binary.put(builder, value.byteLength)
        builder.writeBytes(value)
    },
    get: (reader: BinaryReader) => {
        const length = Uint32Binary.get(reader)
        return reader.readBytes(length)
    }
})
