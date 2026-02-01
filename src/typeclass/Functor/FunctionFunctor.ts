import { Functor2 } from "../Functor"




declare module "../../defun" {
    interface URItoKind2<A,B> {
        function: (a:A) => B
    }
}
export const FunctionFunctor = Functor2<"function">({
    fmap: function <A, B, C>(f: (a: A) => B, fa: (a: C) => A): (a: C) => B {
        return a => {
            return f(fa(a))
        }
    }
}) 