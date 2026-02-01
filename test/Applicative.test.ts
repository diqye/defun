import {test,expect} from "bun:test"
import { FunctionApplicative, FunctionFunctor, ListFunctor, TupleFunctor2, TupleFunctor3 } from "../index"

test("tuple functor",()=>{
    const a = TupleFunctor2.fmap(a=>a+1,["hello",1])
    const b = TupleFunctor3.fmap(a=>a+1,["hello",false,1])
    expect(a).toEqual(["hello",2])
    expect(b).toEqual(["hello",false,2])
})
test("function functor",()=>{
    expect(ListFunctor.replaceBy(0,[1,2,3])).toEqual([0,0,0])
})
test("mean",() => {
    const mean = FunctionApplicative.app(
        FunctionFunctor.fmap(
            (a: number) => (b: number) => a / b,
            (xs: number[]) => xs.reduce((a, b) => a + b, 0)
        ),
        (xs: number[]) => xs.length
    )

    expect(mean([10,9,9,9])).toBe(9.25)
})