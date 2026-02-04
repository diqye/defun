import {expect, test} from "bun:test"
import { ask, FM, FunctionMonad, ListMonad, M } from "../"

test("list monad",()=>{
    const value = M.from(ListMonad,new Array(10).fill(0))
    .semiBind([1,2,3]).value()

    expect(value).toEqual([
        1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3,
        1, 2, 3
    ])

    const a = M.from(ListMonad,[1,2,3])
    .bind(a=>M.from(ListMonad,[1,2,3])
    .bind(b=>{
        if(a*b == 6) return [[a,b]]
        return []
    })).value()

    expect(a).toEqual([
        [2, 3], [3, 2]
    ])
})

test("function monad (FM)",() => {
    // 基础功能测试
    const fm1 = FM.from<string, number>(text => text.length)
    expect(fm1.run("hello")).toBe(5)
    expect(fm1.run("world")).toBe(5)
    expect(fm1.run("")).toBe(0)

    // fromPure 测试
    const fm2 = FM.fromPure(100,"")
    expect(fm2.run("any")).toBe(100)
    expect(fm2.run("")).toBe(100)

    // bind 操作测试
    const fm3 = fm1.bind(len => FM.fromPure(`Length: ${len}`))
    expect(fm3.run("hello")).toBe("Length: 5")
    expect(fm3.run("typescript")).toBe("Length: 10")

    // fmap 操作测试
    const fm4 = fm1.fmap(len => len * 2)
    expect(fm4.run("hello")).toBe(10)
    expect(fm4.run("typescript")).toBe(20)

    // ask 方法测试
    const fm5 = FM.empty<string>()
        .ask(config => FM.fromPure<string, string>(config.toUpperCase()))
    expect(fm5.run("hello")).toBe("HELLO")
    expect(fm5.run("world")).toBe("WORLD")

    // ask 方法结合 bind 的测试
    const fm6 = FM.empty<{ base: number; multiplier: number }>()
        .ask(config => FM.fromPure(config.base * config.multiplier))
    expect(fm6.run({ base: 10, multiplier: 5 })).toBe(50)
    expect(fm6.run({ base: 20, multiplier: 3 })).toBe(60)

    // semiBind 操作测试
    const fm7 = fm1.semiBind(FM.fromPure("fixed value",""))
    expect(fm7.run("anything")).toBe("fixed value")

    // replaceby 操作测试
    const fm8 = fm1.replaceby("replaced")
    expect(fm8.run("test")).toBe("replaced")

    // 复杂组合测试
    const fm9 = FM.from<string, number>(text => text.length)
        .fmap(len => len * 2)
        .bind(len => FM.fromPure(`Double length: ${len}`))
        .fmap(str => str.toUpperCase())

    expect(fm9.run("hello")).toBe("DOUBLE LENGTH: 10")
    expect(fm9.run("typescript")).toBe("DOUBLE LENGTH: 20")
})