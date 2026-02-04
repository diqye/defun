import { defun, type Dependencies, type Kind, type Kind2, type Kind3, type URIs, type URIs2, type URIs3 } from "../defun"
import type { Applicative, Applicative2, Applicative3 } from "./Applicative"


export type MonadMinimal<URI extends URIs> = {
    bind: <A,B>(ma:Kind<URI,A>,f:(a:A)=>Kind<URI,B>) => Kind<URI,B>
}
export const Monad = defun(<URI extends URIs>(minimal:MonadMinimal<URI> & Dependencies<{Applicative:typeof Applicative<URI>}>) => {
    const bind = minimal.bind
    const pure = minimal.$deps.Applicative.pure
    const semiBind = <A,B>(fa:Kind<URI,A>,fb:Kind<URI,B>):Kind<URI,B> => {
        return bind(fa,()=>fb)
    }
    return {
        bind,
        pure,
        semiBind,
        $deps: minimal.$deps
    }
})

export type Monad2Minimal<URI extends URIs2> = {
    bind: <A,B,a>(ma:Kind2<URI,a,A>,f:(a:A)=>Kind2<URI,a,B>) => Kind2<URI,a,B>
}
export const Monad2 = defun(<URI extends URIs2>(minimal:Monad2Minimal<URI> & Dependencies<{Applicative:typeof Applicative2<URI>}>) => {
    const bind = minimal.bind
    const pure = minimal.$deps.Applicative.pure
    const semiBind = <A,B,a>(fa:Kind2<URI,a,A>,fb:Kind2<URI,a,B>):Kind2<URI,a,B> => {
        return bind(fa,()=>fb)
    }
    return {
        bind,
        pure,
        semiBind,
        $deps: minimal.$deps
    }
})

export type Monad3Minimal<URI extends URIs3> = {
    bind: <A,B,a,b>(ma:Kind3<URI,a,b,A>,f:(a:A)=>Kind3<URI,a,b,B>) => Kind3<URI,a,b,B>
}
export const Monad3 = defun(<URI extends URIs3>(minimal:Monad3Minimal<URI> & Dependencies<{Applicative:typeof Applicative3<URI>}>) => {
    const bind = minimal.bind
    const pure = minimal.$deps.Applicative.pure
    const semiBind = <A,B,a,b>(fa:Kind3<URI,a,b,A>,fb:Kind3<URI,a,b,B>):Kind3<URI,a,b,B> => {
        return bind(fa,()=>fb)
    }
    return {
        bind,
        pure,
        semiBind,
        $deps: minimal.$deps
    }
})

export class M<URI extends URIs,T> {
    ctx:Kind<URI,T>
    monad: ReturnType<typeof Monad<URI>>

    private constructor(ctx:typeof this.ctx,monad: typeof this.monad) {
        this.ctx = ctx
        this.monad = monad
    }

    public static from<URI extends URIs,T>(monad:M<URI,T>["monad"],ctx:M<URI,T>["ctx"]) {
        return new M(ctx,monad) 
    }
    public static fromPure<URI extends URIs,T>(monad: M<URI,T>["monad"],a:T) {
        return M.from(
            monad,
            monad.pure(a)
        )
    }
    public value(): Kind<URI, T>{
        return this.ctx
    }
    public pure<a>(a:a): M<URI, a> {
        return M.from(
            this.monad,
            this.monad.pure(a)
        )
    }
    public bind<a>(f: (a: T) => Kind<URI, a> | M<URI,a>): M<URI, a> {
        return M.from(
            this.monad,
            this.monad.bind(this.value(),a=>{
                const b = f(a)
                if(b instanceof M) return b.value()
                return b
            })
        )
    }
    public semiBind<a>(fb:Kind<URI,a> | M<URI,a>): M<URI, a> {
        return M.from(
            this.monad,
            this.monad.semiBind(this.value(),fb instanceof M ? fb.value() : fb)
        )
    }

    public fmap<b>(f:(a:T)=>b): M<URI, b> {
        return M.from(
            this.monad,
            this.monad.$deps.Applicative.$deps.Functor.fmap(f,this.value())
        )
    }
    public replaceBy<b>(b:b): M<URI, b> {
        return M.from(
            this.monad,
            this.monad.$deps.Applicative.$deps.Functor.replaceBy(b,this.value())
        )
    }
}

/*
export class M2<URI extends URIs2, a, A> {
    ctx: Kind2<URI, a, A>
    monad: ReturnType<typeof Monad2<URI>>

    private constructor(ctx: typeof this.ctx, monad: typeof this.monad) {
        this.ctx = ctx
        this.monad = monad
    }

    public static from<URI extends URIs2, a, A>(
        monad: ReturnType<typeof Monad2<URI>>,
        ctx: Kind2<URI, a, A>
    ): M2<URI, a, A> {
        return new M2(ctx, monad) as any
    }

    public static fromPure<URI extends URIs2, a, A>(
        monad: ReturnType<typeof Monad2<URI>>,
        a: A
    ): M2<URI, a, A> {
        return M2.from(
            monad,
            monad.pure(a)
        )
    }

    public value(): Kind2<URI, a, A> {
        return this.ctx
    }

    public pure<X>(a: X): M2<URI, a, X> {
        return M2.from(
            this.monad,
            this.monad.pure(a)
        )
    }

    public bind<X>(f: (a: A) => Kind2<URI, a, X> | M2<URI, a, X>): M2<URI, a, X> {
        return M2.from(
            this.monad,
            this.monad.bind(this.value(), a => {
                const b = f(a)
                if (b instanceof M2) return b.value()
                return b
            })
        )
    }

    public semiBind<X>(fb: Kind2<URI, a, X> | M2<URI, a, X>): M2<URI, a, X> {
        return M2.from(
            this.monad,
            this.monad.semiBind(this.value(), fb instanceof M2 ? fb.value() : fb)
        )
    }

    public fmap<B>(f: (a: A) => B): M2<URI, a, B> {
        return M2.from(
            this.monad,
            this.monad.$deps.Applicative.$deps.Functor.fmap(f, this.value()),
        )
    }

    public replaceBy<B>(b: B): M2<URI, a, B> {
        return M2.from(
            this.monad,
            this.monad.$deps.Applicative.$deps.Functor.replaceBy(b, this.value()),
        )
    }
}


export class M3<URI extends URIs3,a,b,A> {
    ctx:Kind3<URI,a,b,A>
    monad: ReturnType<typeof Monad3<URI>>

    private constructor(ctx:typeof this.ctx,monad: typeof this.monad) {
        this.ctx = ctx
        this.monad = monad
    }

    public static from<URI extends URIs3,a,b,A>(ctx:M3<URI,a,b,A>["ctx"],monad:M3<URI,a,b,A>["monad"]):M3<URI, a, b, A> {
        return new M3(ctx,monad) 
    }
    public static fromPure<URI extends URIs3,a,b,A>(a:A,monad: M3<URI,a,b,A>["monad"]):M3<URI, a, b, A> {
        return M3.from(
            monad.pure(a),
            monad
        )
    }
    public value(): Kind3<URI, a, b, A>{
        return this.ctx
    }
    public pure<x>(a:x): M3<URI, a, b, x> {
        return M3.from(
            this.monad.pure<a,b,x>(a),
            this.monad
        )
    }
    public bind<X>(f: (a: A) => Kind3<URI,a,b,X> | M3<URI,a,b,X>):M3<URI, a, b, X> {
        return M3.from(
            this.monad.bind(this.value(),a=>{
                const b = f(a)
                if(b instanceof M3) return b.value()
                return b
            }),
            this.monad
        )
    }
    public semiBind<x>(fb:Kind3<URI,a,b,x> | M3<URI,a,b,x>): M3<URI, a, b, x> {
        return M3.from(
            this.monad.semiBind(this.value(),fb instanceof M3 ? fb.value() : fb),
            this.monad
        )
    }

    public fmap<x>(f:(a:A)=>x): M3<URI, a, b, x> {
        return M3.from(
            this.monad.$deps.Applicative.$deps.Functor.fmap(f,this.value()),
            this.monad
        )
    }
    public replaceBy<x>(b:x):M3<URI, a, b, x> {
        return M3.from(
            this.monad.$deps.Applicative.$deps.Functor.replaceBy(b,this.value()),
            this.monad
        )
    }
}

*/