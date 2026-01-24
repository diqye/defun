import { defun} from "../defun"

export type EqMinimal<A> = {
    equal: (a:A,b:A) => boolean
} | {
    notEqual: (a:A,b:A) => boolean
}
export const Eq = defun(<A>(minimal:EqMinimal<A>) => {
    const equal = "equal" in minimal ? minimal.equal : (a:A,b:A) : boolean => !notEqual(a,b)
    const notEqual = "notEqual" in minimal ? minimal.notEqual : (a:A,b:A) => !equal(a,b)
    return {
        equal, 
        notEqual
    }
})