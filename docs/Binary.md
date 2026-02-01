# Binary 类型系统文档

## 概述

Binary 是一个用于将 TypeScript 数据类型序列化为二进制格式和从二进制格式反序列化的类型系统。它提供了简单易用的 API，支持多种常见数据类型，并允许自定义扩展。

## 核心概念

### BinaryBuilder

BinaryBuilder 是用于构建二进制数据的类，提供了各种写入方法来处理不同类型的数据。

### BinaryReader

BinaryReader 是用于读取二进制数据的类，提供了各种读取方法来解码不同类型的数据。

### Binary Typeclass

Binary 是一个类型类（Typeclass），通过 `Binary` 函数创建实例，每个实例定义了如何将特定类型的数据编码和解码。

### Bin 类

Bin 类提供了面向对象的接口，方便对值进行包装和操作。

## 基本类型使用

### 布尔值 (BooleanBinary)

布尔值使用 1 字节存储，`true` 表示为 1，`false` 表示为 0。

```typescript
import { BooleanBinary } from "defun"

const value = true
const encoded = BooleanBinary.encode(value) // Uint8Array(1) [1]
const decoded = BooleanBinary.decode(encoded) // true
```

### 数字 (NumberBinary)

数字使用 8 字节的浮点数 (Float64) 存储，支持整数和小数。

```typescript
import { NumberBinary } from "defun"

const value = 42.42
const encoded = NumberBinary.encode(value)
const decoded = NumberBinary.decode(encoded) // 42.42
```

### 字符串 (StringBinary)

字符串使用 UTF-8 编码，长度前缀存储。

```typescript
import { StringBinary } from "defun"

const value = "Hello, 世界!"
const encoded = StringBinary.encode(value)
const decoded = StringBinary.decode(encoded) // "Hello, 世界!"
```

### 字节数组 (Uint8ArrayBinary)

字节数组直接存储，并包含长度前缀。

```typescript
import { Uint8ArrayBinary } from "defun"

const value = new Uint8Array([1, 2, 3, 4])
const encoded = Uint8ArrayBinary.encode(value)
const decoded = Uint8ArrayBinary.decode(encoded) // Uint8Array(4) [1, 2, 3, 4]
```

## 复合类型使用

### 数组 (ListBinary)

ListBinary 是一个工厂函数，需要传入元素类型的 Binary 实例。

```typescript
import { ListBinary, NumberBinary } from "defun"

const numberArrayBinary = ListBinary(NumberBinary)
const value = [1, 2, 3, 4, 5]
const encoded = numberArrayBinary.encode(value)
const decoded = numberArrayBinary.decode(encoded) // [1, 2, 3, 4, 5]
```

### 8个布尔值元组 (Tuple8BooleanBinary)

Tuple8BooleanBinary 将 8 个布尔值打包成一个字节存储，节省空间。

```typescript
import { Tuple8BooleanBinary } from "defun"

const value = [true, true, false, false, true, false, false, true] as const
const encoded = Tuple8BooleanBinary.encode(value) // Uint8Array(1) [0b11001001]
const decoded = Tuple8BooleanBinary.decode(encoded) // [true, true, false, false, true, false, false, true]
```

## 复杂对象类型 (ObjectBinary)

ObjectBinary 支持 JSON 类型外加 Uint8Array 类型，允许嵌套结构。

```typescript
import { ObjectBinary, type JSONValue } from "defun"

const value: JSONValue = {
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
const decoded = ObjectBinary.decode(encoded)
```

## 自定义类型

您可以通过实现 BinaryMinimal 接口来创建自定义类型的 Binary 实例。

```typescript
import { Binary, type BinaryBuilder, type BinaryReader } from "defun"
import { StringBinary, NumberBinary, ListBinary } from "defun"

type User = {
    name: string
    age: number
    hobbies: string[]
}

const UserBinary = Binary<User>({
    put: (builder: BinaryBuilder, value: User): void => {
        StringBinary.put(builder, value.name)
        NumberBinary.put(builder, value.age)
        ListBinary(StringBinary).put(builder, value.hobbies)
    },
    get: (reader: BinaryReader): User => {
        return {
            name: StringBinary.get(reader),
            age: NumberBinary.get(reader),
            hobbies: ListBinary(StringBinary).get(reader)
        }
    }
})

// 使用自定义类型
const user: User = {
    name: "张三",
    age: 25,
    hobbies: ["读书", "游泳", "编程"]
}

const encoded = UserBinary.encode(user)
const decoded = UserBinary.decode(encoded)
```

## 编码和解码方法

### 直接编码为 Uint8Array

```typescript
const bytes = SomeBinary.encode(value)
```

### 从 Uint8Array 解码

```typescript
const decoded = SomeBinary.decode(bytes)
```

### 编码为 Base64 字符串

```typescript
const base64 = SomeBinary.encodeBase64(value)
```

### 从 Base64 字符串解码

```typescript
const decoded = SomeBinary.decodeBase64(base64)
```

### 编码为 Hex 字符串

```typescript
const hex = SomeBinary.encodeHex(value)
```

### 从 Hex 字符串解码

```typescript
const decoded = SomeBinary.decodeHex(hex)
```

## Bin 类的使用

Bin 类提供了面向对象的接口，方便对值进行包装和操作。

```typescript
import { Bin, StringBinary } from "defun"

const bin = Bin.from("Hello, World!", StringBinary)

// 编码
const bytes = bin.encode()
const base64 = bin.encodeBase64()
const hex = bin.encodeHex()

// 解码
const decodedBin = Bin.fromBase64(base64, StringBinary)
console.log(decodedBin.ctx) // "Hello, World!"
```

## 应用场景

### 网络传输

二进制格式比 JSON 更紧凑，可以减少网络传输大小。

```typescript
import { ObjectBinary } from "defun"
import type { JSONValue } from "defun"

// 发送数据
const data: JSONValue = { message: "Hello", count: 5 }
const bytes = ObjectBinary.encode(data)
await fetch("/api/endpoint", {
    method: "POST",
    body: bytes,
    headers: { "Content-Type": "application/octet-stream" }
})

// 接收数据
const response = await fetch("/api/endpoint")
const responseBytes = new Uint8Array(await response.arrayBuffer())
const receivedData = ObjectBinary.decode(responseBytes)
```

### 数据存储

二进制格式适合存储在文件或数据库中，可以提高存储效率。

```typescript
import { ObjectBinary } from "defun"
import type { JSONValue } from "defun"

const fs = require("fs")

const data: JSONValue = {
    id: 1,
    name: "产品数据",
    details: "详细信息",
    image: new Uint8Array([...]) // 图片字节数据
}

// 写入文件
const bytes = ObjectBinary.encode(data)
fs.writeFileSync("data.bin", bytes)

// 读取文件
const readBytes = fs.readFileSync("data.bin")
const readData = ObjectBinary.decode(readBytes)
```

### 游戏开发

在游戏开发中，二进制格式可以提高数据传输和存储的效率。

```typescript
import { Binary, type BinaryBuilder, type BinaryReader } from "defun"
import { NumberBinary } from "defun"

type Vector3 = { x: number; y: number; z: number }

const Vector3Binary = Binary<Vector3>({
    put: (builder: BinaryBuilder, value: Vector3): void => {
        NumberBinary.put(builder, value.x)
        NumberBinary.put(builder, value.y)
        NumberBinary.put(builder, value.z)
    },
    get: (reader: BinaryReader): Vector3 => {
        return {
            x: NumberBinary.get(reader),
            y: NumberBinary.get(reader),
            z: NumberBinary.get(reader)
        }
    }
})

// 编码游戏状态
const position = { x: 10.5, y: 20.0, z: 30.5 }
const bytes = Vector3Binary.encode(position)

// 解码游戏状态
const decodedPosition = Vector3Binary.decode(bytes)
```

## 性能对比

与 JSON 相比，Binary 类型系统在编码和解码速度以及传输大小方面都有优势。对于包含大量数字或字节数据的场景，二进制格式可以显著减少数据大小。

## 总结

Binary 类型系统提供了简单易用的 API，支持多种常见数据类型，并允许自定义扩展。它适合在需要高效数据传输和存储的场景中使用，如网络传输、数据存储和游戏开发等。
