import { Applicative2 } from "../Applicative"
import { EitherFunctor, fromRight, type Either } from "../Functor/EitherFunctor"


export const EitherApplicative = Applicative2<"either">({
    $deps: {
        Functor: EitherFunctor
    },
    pure: <A, a>(a: A): Either<a, A> => {
        return fromRight(a, null as a)
    },
    liftA2: function <A, B, C, a>(f: (a: A, b: B) => C, fa: Either<a, A>, fb: Either<a, B>): Either<a, C> {
        if(fa.cos == "left") return fa
        if(fb.cos == "left") return fb
        return fromRight(f(fa.right,fb.right))
    }
})