import { Functor } from "../Functor"

declare module "../../defun" {
    interface URItoKind<A> {
        list: A[]
    }
}
export const ListFunctor = Functor<"list">({
    fmap: function <A, B>(f: (a: A) => B, fa: A[]): B[] {
        return fa.map(f)
    }
})