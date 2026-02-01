import { defun } from "../defun"

/**
 * 二进制数据构建器，用于将各种数据类型编码为二进制格式
 */
export class BinaryBuilder {
    private buffer: number[] = []

    /**
     * 写入单个字节
     * @param value 要写入的字节值（0-255）
     * @returns 当前实例，支持链式调用
     */
    writeByte(value: number): this {
        this.buffer.push(value & 0xff)
        return this
    }

    /**
     * 写入多个字节
     * @param bytes 要写入的字节数组
     * @returns 当前实例，支持链式调用
     */
    writeBytes(bytes: Uint8Array): this {
        for (let i = 0; i < bytes.length; i++) {
            this.writeByte(bytes[i]!)
        }
        return this
    }

    /**
     * 写入无符号 8 位整数
     * @param value 要写入的无符号 8 位整数值（0-255）
     * @returns 当前实例，支持链式调用
     */
    writeUint8(value: number): this {
        this.writeByte(value)
        return this
    }

    /**
     * 写入有符号 8 位整数
     * @param value 要写入的有符号 8 位整数值（-128-127）
     * @returns 当前实例，支持链式调用
     */
    writeInt8(value: number): this {
        this.writeByte(value & 0xff)
        return this
    }

    /**
     * 写入无符号 16 位整数（大端字节序）
     * @param value 要写入的无符号 16 位整数值（0-65535）
     * @returns 当前实例，支持链式调用
     */
    writeUint16(value: number): this {
        this.writeByte((value >> 8) & 0xff)
        this.writeByte(value & 0xff)
        return this
    }

    /**
     * 写入有符号 16 位整数（大端字节序）
     * @param value 要写入的有符号 16 位整数值（-32768-32767）
     * @returns 当前实例，支持链式调用
     */
    writeInt16(value: number): this {
        this.writeByte((value >> 8) & 0xff)
        this.writeByte(value & 0xff)
        return this
    }

    /**
     * 写入无符号 32 位整数（大端字节序）
     * @param value 要写入的无符号 32 位整数值（0-4294967295）
     * @returns 当前实例，支持链式调用
     */
    writeUint32(value: number): this {
        this.writeByte((value >> 24) & 0xff)
        this.writeByte((value >> 16) & 0xff)
        this.writeByte((value >> 8) & 0xff)
        this.writeByte(value & 0xff)
        return this
    }

    /**
     * 写入有符号 32 位整数（大端字节序）
     * @param value 要写入的有符号 32 位整数值（-2147483648-2147483647）
     * @returns 当前实例，支持链式调用
     */
    writeInt32(value: number): this {
        this.writeByte((value >> 24) & 0xff)
        this.writeByte((value >> 16) & 0xff)
        this.writeByte((value >> 8) & 0xff)
        this.writeByte(value & 0xff)
        return this
    }

    /**
     * 写入 64 位浮点数（大端字节序）
     * @param value 要写入的 64 位浮点数值
     * @returns 当前实例，支持链式调用
     */
    writeFloat64(value: number): this {
        const buffer = new ArrayBuffer(8)
        const view = new DataView(buffer)
        view.setFloat64(0, value, false)
        this.writeBytes(new Uint8Array(buffer))
        return this
    }

    /**
     * 写入布尔值（1 字节表示）
     * @param value 要写入的布尔值
     * @returns 当前实例，支持链式调用
     */
    writeBoolean(value: boolean): this {
        this.writeByte(value ? 1 : 0)
        return this
    }

    /**
     * 写入字符串（UTF-8 编码，长度前缀）
     * @param value 要写入的字符串
     * @returns 当前实例，支持链式调用
     */
    writeString(value: string): this {
        const encoder = new TextEncoder()
        const bytes = encoder.encode(value)
        this.writeUint32(bytes.length)
        this.writeBytes(bytes)
        return this
    }

    /**
     * 将缓冲区内容编码为 Uint8Array
     * @returns 编码后的 Uint8Array
     */
    encode(): Uint8Array {
        return new Uint8Array(this.buffer)
    }
}

/**
 * 二进制数据读取器，用于从二进制格式解码各种数据类型
 */
export class BinaryReader {
    private buffer: Uint8Array
    private offset: number = 0

    /**
     * 创建一个二进制读取器实例
     * @param bytes 要读取的二进制数据
     */
    constructor(bytes: Uint8Array) {
        this.buffer = bytes
    }

    /**
     * 读取单个字节
     * @returns 读取到的字节值（0-255）
     */
    readByte(): number {
        const value = this.buffer[this.offset]
        this.offset++
        return value!
    }

    /**
     * 读取多个字节
     * @param length 要读取的字节数
     * @returns 读取到的字节数组
     */
    readBytes(length: number): Uint8Array {
        const bytes = this.buffer.slice(this.offset, this.offset + length)
        this.offset += length
        return bytes
    }

    /**
     * 读取无符号 8 位整数
     * @returns 读取到的无符号 8 位整数值（0-255）
     */
    readUint8(): number {
        return this.readByte()
    }

    /**
     * 读取有符号 8 位整数
     * @returns 读取到的有符号 8 位整数值（-128-127）
     */
    readInt8(): number {
        const value = this.readByte()
        return value > 127 ? value - 256 : value
    }

    /**
     * 读取无符号 16 位整数（大端字节序）
     * @returns 读取到的无符号 16 位整数值（0-65535）
     */
    readUint16(): number {
        const b1 = this.readByte()
        const b2 = this.readByte()
        return (b1 << 8) | b2
    }

    /**
     * 读取有符号 16 位整数（大端字节序）
     * @returns 读取到的有符号 16 位整数值（-32768-32767）
     */
    readInt16(): number {
        const value = this.readUint16()
        return value > 32767 ? value - 65536 : value
    }

    /**
     * 读取无符号 32 位整数（大端字节序）
     * @returns 读取到的无符号 32 位整数值（0-4294967295）
     */
    readUint32(): number {
        const b1 = this.readByte()
        const b2 = this.readByte()
        const b3 = this.readByte()
        const b4 = this.readByte()
        return (b1 << 24) | (b2 << 16) | (b3 << 8) | b4
    }

    /**
     * 读取有符号 32 位整数（大端字节序）
     * @returns 读取到的有符号 32 位整数值（-2147483648-2147483647）
     */
    readInt32(): number {
        const value = this.readUint32()
        return value > 0x7fffffff ? value - 0x100000000 : value
    }

    /**
     * 读取 64 位浮点数（大端字节序）
     * @returns 读取到的 64 位浮点数值
     */
    readFloat64(): number {
        const bytes = this.readBytes(8)
        const buffer = new ArrayBuffer(8)
        const view = new DataView(buffer)
        for (let i = 0; i < 8; i++) {
            view.setUint8(i, bytes[i]!)
        }
        return view.getFloat64(0, false)
    }

    /**
     * 读取布尔值（1 字节表示）
     * @returns 读取到的布尔值
     */
    readBoolean(): boolean {
        return this.readByte() === 1
    }

    /**
     * 读取字符串（UTF-8 编码，长度前缀）
     * @returns 读取到的字符串
     */
    readString(): string {
        const length = this.readUint32()
        const bytes = this.readBytes(length)
        const decoder = new TextDecoder()
        return decoder.decode(bytes)
    }

    /**
     * 获取当前读取偏移量
     * @returns 当前偏移量
     */
    getOffset(): number {
        return this.offset
    }

    /**
     * 检查是否已到达缓冲区末尾
     * @returns 是否到达缓冲区末尾
     */
    isEnd(): boolean {
        return this.offset >= this.buffer.length
    }
}

/**
 * Binary typeclass 的最小实现接口，需要实现 put 和 get 方法
 */
export type BinaryMinimal<A> = {
    /**
     * 将值编码到二进制构建器中
     * @param builder 二进制构建器
     * @param value 要编码的值
     */
    put: (builder: BinaryBuilder, value: A) => void
    /**
     * 从二进制读取器中解码值
     * @param reader 二进制读取器
     * @returns 解码后的值
     */
    get: (reader: BinaryReader) => A
}

/**
 * Binary typeclass 工厂函数，用于创建 Binary 实例
 * @param minimal 最小实现接口
 * @returns 完整的 Binary 实例，包含所有派生方法
 */
export const Binary = defun(<A>(minimal: BinaryMinimal<A>) => {
    // 基础实现
    const put = minimal.put
    const get = minimal.get

    /**
     * 将值直接编码为 Uint8Array
     * @param value 要编码的值
     * @returns 编码后的 Uint8Array
     */
    const encode = (value: A): Uint8Array => {
        const builder = new BinaryBuilder()
        put(builder, value)
        return builder.encode()
    }

    /**
     * 从 Uint8Array 中解码值
     * @param bytes 要解码的 Uint8Array
     * @returns 解码后的值
     */
    const decode = (bytes: Uint8Array): A => {
        const reader = new BinaryReader(bytes)
        return get(reader)
    }

    /**
     * 将值编码为 base64 字符串
     * @param value 要编码的值
     * @returns 编码后的 base64 字符串
     */
    const encodeBase64 = (value: A): string => {
        const bytes = encode(value)
        return btoa(String.fromCharCode(...bytes))
    }

    /**
     * 从 base64 字符串中解码值
     * @param encoded 要解码的 base64 字符串
     * @returns 解码后的值
     */
    const decodeBase64 = (encoded: string): A => {
        const bytes = new Uint8Array(atob(encoded).split('').map(c => c.charCodeAt(0)))
        return decode(bytes)
    }

    /**
     * 将值编码为 hex 字符串
     * @param value 要编码的值
     * @returns 编码后的 hex 字符串
     */
    const encodeHex = (value: A): string => {
        const bytes = encode(value)
        return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
    }

    /**
     * 从 hex 字符串中解码值
     * @param hex 要解码的 hex 字符串
     * @returns 解码后的值
     */
    const decodeHex = (hex: string): A => {
        const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
        return decode(bytes)
    }

    return {
        put,
        get,
        encode,
        decode,
        encodeBase64,
        decodeBase64,
        encodeHex,
        decodeHex
    }
})

/**
 * Bin 类提供了包装值的对象接口，使 Binary 操作更加面向对象
 */
export class Bin<T> {
    ctx: T
    clt: ReturnType<typeof Binary<T>>

    private constructor(ctx: typeof this.ctx, clt: typeof this.clt) {
        this.clt = clt
        this.ctx = ctx
    }

    /**
     * 创建 Bin 实例
     * @param ctx 要包装的值
     * @param clt Binary 实例
     * @returns Bin 实例
     */
    public static from<T>(ctx: T, clt: ReturnType<typeof Binary<T>>) {
        return new this(ctx, clt)
    }

    /**
     * 将值编码到二进制构建器中
     * @param builder 二进制构建器
     * @returns 当前 Bin 实例，支持链式调用
     */
    public put(builder: BinaryBuilder) {
        this.clt.put(builder, this.ctx)
        return this
    }

    /**
     * 从二进制读取器中解码值并创建 Bin 实例
     * @param reader 二进制读取器
     * @param clt Binary 实例
     * @returns Bin 实例
     */
    public static get<T>(reader: BinaryReader, clt: ReturnType<typeof Binary<T>>) {
        const t = clt.get(reader)
        return Bin.from(t, clt)
    }

    /**
     * 将值编码为 Uint8Array
     * @returns 编码后的 Uint8Array
     */
    public encode(): Uint8Array {
        return this.clt.encode(this.ctx)
    }

    /**
     * 将值编码为 base64 字符串
     * @returns 编码后的 base64 字符串
     */
    public encodeBase64(): string {
        return this.clt.encodeBase64(this.ctx)
    }

    /**
     * 将值编码为 hex 字符串
     * @returns 编码后的 hex 字符串
     */
    public encodeHex(): string {
        return this.clt.encodeHex(this.ctx)
    }

    /**
     * 从 Uint8Array 中解码值并创建 Bin 实例
     * @param bytes 要解码的 Uint8Array
     * @param clt Binary 实例
     * @returns Bin 实例
     */
    public static decode<T>(bytes: Uint8Array, clt: ReturnType<typeof Binary<T>>): Bin<T> {
        const t = clt.decode(bytes)
        return Bin.from(t, clt)
    }

    /**
     * 从 Uint8Array 中解码值并创建 Bin 实例（别名）
     */
    public static fromUint8Array = this.decode

    /**
     * 从 base64 字符串中解码值并创建 Bin 实例（别名）
     */
    public static fromBase64 = this.decodeBase64

    /**
     * 从 hex 字符串中解码值并创建 Bin 实例（别名）
     */
    public static fromHex = this.decodeHex

    /**
     * 从 base64 字符串中解码值并创建 Bin 实例
     * @param encoded 要解码的 base64 字符串
     * @param clt Binary 实例
     * @returns Bin 实例
     */
    public static decodeBase64<T>(encoded: string, clt: ReturnType<typeof Binary<T>>): Bin<T> {
        const t = clt.decodeBase64(encoded)
        return Bin.from(t, clt)
    }

    /**
     * 从 hex 字符串中解码值并创建 Bin 实例
     * @param hex 要解码的 hex 字符串
     * @param clt Binary 实例
     * @returns Bin 实例
     */
    public static decodeHex<T>(hex: string, clt: ReturnType<typeof Binary<T>>): Bin<T> {
        const t = clt.decodeHex(hex)
        return Bin.from(t, clt)
    }
}
