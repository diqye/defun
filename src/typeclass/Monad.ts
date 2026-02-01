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
        semiBind
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
        semiBind
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
        semiBind
    }
})

export class M<URI extends URIs,T> {
    ctx:Kind<URI,T>
    monad: ReturnType<typeof Monad<URI>>

    private constructor(ctx:typeof this.ctx,monad: typeof this.monad) {
        this.ctx = ctx
        this.monad = monad
    }

    public static from<URI extends URIs,T>(ctx:Kind<URIs,T>,monad: ReturnType<typeof Monad<URI>>) {
        return new this(ctx,monad) 
    }

    public pure<a>(a:a) {
        return M.from(
            this.monad.pure(a),
            this.monad
        )
    }
    public bind<a>(f: (a: T) => Kind<URI, a>) {
        return M.from(
            this.monad.bind(this.ctx,f),
            this.monad
        )
    }
    public semiBind<a>(fb:Kind<URI,a>) {
        return M.from(
            this.monad.semiBind(this.ctx,fb),
            this.monad
        )
    }
}

