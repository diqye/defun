import { Functor2 } from "../Functor"

export type Either<L,R> = {
    cos: "left",
    left: L
} | {
    cos: "right",
    right: R
}

export function fromLeft<L,R>(left:L,rightType?:R):Either<L,R> {
    return {
        cos: "left",
        left
    }
}
export function fromRight<L,R>(right:R,leftType?:L):Either<L,R> {
    return {
        cos: "right",
        right
    }
}
declare module "../../defun" {
    interface URItoKind2<A,B> {
        either: Either<A,B>
    }
}
export const EitherFunctor = Functor2<"either">({
    fmap: function <A, B, C>(f: (a: A) => B, fa: Either<C, A>): Either<C, B> {
        if(fa.cos == "left") return fa
        return {
            ...fa,
            right: f(fa.right)
        }
    }
}) 