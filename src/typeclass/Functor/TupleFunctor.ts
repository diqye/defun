import { Functor2, Functor3 } from "../Functor";

declare module "../../defun" {
    interface URItoKind2<A,B> {
        tuple: [A,B]
    }
}
export const TupleFunctor2 = Functor2<"tuple">({
    fmap: function <A, B, C>(f: (a: A) => B, fa: [C, A]): [C, B] {
        return [fa[0],f(fa[1])]
    }
})
declare module "../../defun" {
    interface URItoKind3<A,B,C> {
        tuple: [A,B,C]
    }
}
export const TupleFunctor3 = Functor3<"tuple">({
    fmap: function <A, B, C, D>(f: (a: A) => B, fa: [C, D, A]): [C, D, B] {
        return [fa[0],fa[1],f(fa[2])]
    }
})