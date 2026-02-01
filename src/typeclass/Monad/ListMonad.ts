import { ListApplicative } from "../Applicative/ListApplicative";
import { Monad } from "../Monad";

export const ListMonad = Monad<"list">({
    bind: function <A, B>(ma: A[], f: (a: A) => B[]): B[] {
        return ma.map(a=>{
            return f(a)
        }).reduce((xs,x)=>xs.concat(x),[])
    },
    $deps: {
        Applicative: ListApplicative
    }
})