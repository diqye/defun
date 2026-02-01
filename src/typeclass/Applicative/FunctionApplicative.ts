import { Applicative2 } from "../Applicative";
import { FunctionFunctor } from "../Functor/FunctionFunctor";


export const FunctionApplicative = Applicative2<"function">({
    pure: function <A, a>(a: A): (a: a) => A {
        return (_) => a;
    },
    $deps: {
        Functor: FunctionFunctor
    },
    liftA2: function <A, B, C, a>(f: (a: A, b: B) => C, fa: (a: a) => A, fb: (a: a) => B): (a: a) => C {
        return r => {
            return f(fa(r),fb(r))
        }
    }
})