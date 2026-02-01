import {test} from "bun:test"
import { ListMonad } from "../"

test("list monad",()=>{
    const xs = ListMonad.semiBind([1,2,3],[10,20,30])
})
