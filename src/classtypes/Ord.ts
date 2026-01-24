import { defun, type Dependencies } from "../defun"
import type { Eq } from "./Eq"

export type OrdMinimal<a> = {
    compare: (a:a,b:a) => number
} | {
    lte: (a:a,b:a) => boolean
}
export const Ord = defun(<A>(
    minimal:
        OrdMinimal<A> &
        Dependencies<{
            Eq: typeof Eq<A>
        }>
) => {
    const compare = "compare" in minimal ? minimal.compare : (a:A,b:A) => {
        if(lte(a,b)) return -1
        if(minimal.$deps.Eq.equal(a,b)) return 0
        return 1
    }
    const lte = "lte" in minimal ? minimal.lte : (a:A,b:A):boolean => {
        return compare(a,b) <= 0
    }
    const gt = (a:A,b:A) => {
        return compare(a,b) > 0
    }
    const gte = (a:A,b:A) => {
        return compare(a,b) >= 0
    }
    const lt = (a:A,b:A) => {
        return compare(a,b) < 0
    }
    const max = (x:A,...xs:A[]) => {
        return xs.reduce((a,b)=>{
            if(gt(a,b)) return a
            return b
        },x)
    }
    const min = (x:A,...xs:A[]) => {
        return xs.reduce((a,b)=>{
            if(lt(a,b)) return a
            return b
        },x)
    }
    return {
        gt,
        compare,
        gte,
        lte,
        lt,
        max,
        min
    }
})
