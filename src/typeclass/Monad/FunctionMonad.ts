import { FunctionApplicative } from "../Applicative/FunctionApplicative";
import { Monad2 } from "../Monad";

export const FunctionMonad = Monad2<"function">({
    bind: function <A, B, a>(ma: (a: a) => A, f: (a: A) => (a: a) => B): (a: a) => B {
        return a => {
            const x = ma(a)
            const y = f(x)
            return y(a)
        }
    },
    $deps: {
        Applicative: FunctionApplicative
    }
})

export const ask = <a>(a:a) => a

export class FM<P,R> {
    f: (p:P) => R
    static readonly fm = FunctionMonad


    private constructor(f: typeof this.f){
        this.f = f
    }

    public static from<P,R>(f: FM<P,R>["f"]) {
        return new this(f)
    }

    public static fromPure<P,R>(a:R,p?:P) {
        return FM.from(
            this.fm.pure(a,p) 
        )
    }

    public static empty<P>(ptype?:P) {
        return FM.fromPure(undefined,ptype)
    }

    public run(p:P) {
        return this.f(p)
    }
    public value() {
        return this.f
    }

    public bind<R2>(ffm: (a:R)=>FM<P,R2>) {
        const f = (a:R) => {
            return ffm(a).value()
        }
        return FM.from(
            FM.fm.bind(this.value(),f)
        )
    }

    public semiBind<R2>(fm:FM<P,R2>) {
        return FM.from(
            FM.fm.semiBind(this.value(),fm.value())
        )
    }

    public fmap<R2>(f:(a:R)=>R2) {
        return FM.from(
            FM.fm.$deps.Applicative.$deps.Functor.fmap(f,this.value())
        )
    }

    public replaceby<R2>(r2:R2) {
        return FM.from(
            FM.fm.$deps.Applicative.$deps.Functor.replaceBy(r2,this.value())
        )
    }

    public ask<R2>(ffm: (a:P)=>FM<P,R2>) {
        return FM.from<P,P>(ask).bind(ffm)
    }
}
