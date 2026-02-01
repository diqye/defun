import { Applicative } from "../Applicative"
import { ListFunctor } from "../Functor/ListFunctor"

// declare module "../../defun" {
//     interface URItoKind<A> {
//         list: A[]
//     }
// }
export const ListApplicative = Applicative<"list">({
    pure: function <A>(a: A): A[] {
        return [a]
    },
    liftA2: <A, B, C>(f: (a: A, b: B) => C, fa: A[], fb: B[]): C[] => {
        let cs = [] as C[]
        for(const [key,a] of fa.entries()) {
            if(key >= fb.length) break
            cs.push(f(a,fb[key]!))
        }

        return cs
    },
    $deps: {
        Functor: ListFunctor
    }
})