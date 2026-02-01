import { test, expect } from "bun:test"
import { BooleanBinary, StringBinary, NumberBinary, Uint8Binary, ListBinary, Binary, BinaryBuilder, BinaryReader, Tuple8BooleanBinary, Uint8ArrayBinary, Bin, ObjectBinary, type JSONValue } from "../index"

test("BooleanBinary 序列化和反序列化", () => {
    const value = true
    const encoded = BooleanBinary.encode(value)
    const decoded = BooleanBinary.decode(encoded)
    expect(decoded).toBe(value)
})

test("StringBinary 序列化和反序列化", () => {
    const value = "Hello, Binary!,你好呀"
    const encoded = StringBinary.encode(value)
    const decoded = StringBinary.decode(encoded)
    expect(decoded).toBe(value)
})

test("NumberBinary 序列化和反序列化", () => {
    const value = 42.42
    const encoded = NumberBinary.encode(value)
    const decoded = NumberBinary.decode(encoded)
    expect(decoded).toBeCloseTo(value, 5)
})

test("Uint8Binary 序列化和反序列化", () => {
    const value = 255
    const encoded = Uint8Binary.encode(value)
    const decoded = Uint8Binary.decode(encoded)
    expect(decoded).toBe(value)
})

test("ArrayBinary 序列化和反序列化", () => {
    const elementBinary = NumberBinary
    const arrayBinary = ListBinary(elementBinary)
    const value = [1, 2, 3, 4, 5]
    const encoded = arrayBinary.encode(value)
    const decoded = arrayBinary.decode(encoded)
    expect(decoded).toEqual(value)
})

test("ArrayBinary 序列化和反序列化复杂数组", () => {
    const stringArrayBinary = ListBinary(StringBinary)
    const value = ["apple", "banana", "cherry"]
    const encoded = stringArrayBinary.encode(value)
    const decoded = stringArrayBinary.decode(encoded)
    expect(decoded).toEqual(value)
})

test("base64 编码和解码", () => {
    const value = "Test Base64 Encoding, 我是"
    const encoded = StringBinary.encodeBase64(value)
    const decoded = StringBinary.decodeBase64(encoded)
    expect(decoded).toBe(value)
})

test("hex 编码和解码", () => {
    const value = 12345
    const encoded = NumberBinary.encodeHex(value)
    const decoded = NumberBinary.decodeHex(encoded)
    expect(decoded).toBeCloseTo(value, 5)
})

test("自定义类型 编码和解码",() => {
    type Value = {
        name: string,
        age: number,
        list: Value []
    }
    const value:Value = {
        name: "name",
        age: 22,
        list: [{
            name: "name1",
            age:1,
            list:[] 
        },{
            name: "name2",
            age:2,
            list:[{
                name: "llll",
                age: 1000,
                list:[]
            }]
        }] 
    }
    const CustomBinary = Binary<Value>({
        put: function (builder: BinaryBuilder, value: Value): void {
            StringBinary.put(builder,value.name)
            NumberBinary.put(builder,value.age)
            ListBinary(CustomBinary).put(builder,value.list)
        },
        get: function (reader: BinaryReader): Value {
            return {
                name: StringBinary.get(reader),
                age: NumberBinary.get(reader),
                list: ListBinary(CustomBinary).get(reader)
            }
        }
    })

    const u8array = CustomBinary.encode(value)
    const result = CustomBinary.decode(u8array)
    expect(result).toEqual(value)
    // CustomBinary.decode
    // CustomBinary.decodeBase64
    // CustomBinary.decodeHex
    // CustomBinary.encode
    // CustomBinary.encodeBase64
    // CustomBinary.encodeHex
})

test("tuple8boolean",()=>{
    const value = [true,true,false,false,true,false,false,true] as const
    const u8array = Tuple8BooleanBinary.encode(value)
    expect(u8array).toEqual(new Uint8Array([0b11001001]))
    expect(Tuple8BooleanBinary.decode(u8array)).toEqual(value)
})

test("Uint8Array",()=>{
    const bin = ListBinary(Binary<{ name: string, value: Uint8Array }>({
        put: function (builder: BinaryBuilder, value: { name: string; value: Uint8Array }): void {
            StringBinary.put(builder, value.name)
            Uint8ArrayBinary.put(builder, value.value)
        },
        get: function (reader: BinaryReader): { name: string; value: Uint8Array } {
            return {
                name: StringBinary.get(reader),
                value: Uint8ArrayBinary.get(reader)
            }
        }
    }))

    const value = [{
        name: "a.mp3",
        value: new Uint8Array([1, 2, 3])
    }, {
        name: "b.mp3",
        value: new Uint8Array([3, 2, 0,0])
    }]
    const b64 = Bin.from(value,bin).encodeBase64()
    const decoded = Bin.fromBase64(b64,bin)
    expect(decoded.ctx).toEqual(value)
})

test("ObjectBinary 序列化和反序列化", () => {
    const value = {
        name: "测试对象",
        age: 30,
        isActive: true,
        score: 98.5,
        tags: ["typescript", "binary", "serialization"],
        data: new Uint8Array([0x10, 0x20, 0x30, 0x40]),
        nested: {
            level: 2,
            details: "嵌套对象"
        },
        nullValue: null
    }

    const encoded = ObjectBinary.encode(value)
    const decoded = ObjectBinary.decode(encoded)  as any

    // 比较基本属性
    expect(decoded.name).toBe(value.name)
    expect(decoded.age).toBe(value.age)
    expect(decoded.isActive).toBe(value.isActive)
    expect(decoded.score).toBeCloseTo(value.score, 5)
    expect(decoded.nullValue).toBeNull()

    // 比较数组
    expect(decoded.tags).toEqual(value.tags)

    // 比较嵌套对象
    expect(decoded.nested).toEqual(value.nested)

    // 比较 Uint8Array
    expect(decoded.data).toBeInstanceOf(Uint8Array)
    expect(Array.from(decoded.data as Uint8Array)).toEqual(Array.from(value.data as Uint8Array))
})

test("ObjectBinary base64 编码和解码", () => {
    const value: JSONValue = {
        message: "Hello, ObjectBinary!",
        numbers: [1, 2, 3, 4, 5],
        image: new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0])
    }

    const encoded = ObjectBinary.encodeBase64(value)
    const decoded = ObjectBinary.decodeBase64(encoded) as any

    expect(decoded.message).toBe(value.message)
    expect(decoded.numbers).toEqual(value.numbers)
    expect(decoded.image).toBeInstanceOf(Uint8Array)
    expect(Array.from(decoded.image as Uint8Array)).toEqual(Array.from(value.image as Uint8Array))
})