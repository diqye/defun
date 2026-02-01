import { defun, type Dependencies, type Expand, type Kind, type Kind2, type Kind3, type URIs, type URIs2, type URIs3 } from "../defun"
import type { Functor, Functor2, Functor3 } from "./Functor"


export type ApplicativeMinimal<URI extends URIs> = {
    pure: <A>(a:A) => Kind<URI,A>,
} & ({
    liftA2:<A,B,C>(f:(a:A,b:B)=>C,fa:Kind<URI,A>,fb:Kind<URI,B>) => Kind<URI,C>
} | {
    app:<A,B>(ff:Kind<URI,(a:A)=>B>,fa:Kind<URI,A>) => Kind<URI,B>
})
export const Applicative = defun(<A extends URIs>(minimal:ApplicativeMinimal<A> & Dependencies<{Functor:typeof Functor<A>}>) => {
    const pure = minimal.pure
    const liftA2 = "liftA2" in minimal ? minimal.liftA2 : <a,b,c>(f:(a:a,b:b)=>c,fa:Kind<A,a>,fb:Kind<A,b>): Kind<A,c> => {
        const ff = minimal.$deps.Functor.fmap(a=>(b:b)=>f(a,b),fa)
        return app(ff,fb)
    }

    const leftArrow = <a,b>(fa:Kind<A,a>,fb:Kind<A,b>) => {
        return liftA2((a,b)=>a,fa,fb)
    }
    const rightArrow = <a,b>(fa:Kind<A,a>,fb:Kind<A,b>) => {
        return liftA2((a,b)=>b,fa,fb)
    }

    const app = "app" in minimal ? minimal.app : <a,b>(ff:Kind<A,(a:a)=>b>,fa:Kind<A,a>) => {
        return liftA2((a,b)=>a(b),ff,fa)
    }
    return {
        pure,
        app,
        liftA2,
        leftArrow,
        rightArrow
    }
})

export type Applicative2Minimal<URI extends URIs2> = {
    pure: <A,a>(a:A) => Kind2<URI,a,A>,
    liftA2:<A,B,C,a>(f:(a:A,b:B)=>C,fa:Kind2<URI,a,A>,fb:Kind2<URI,a,B>) => Kind2<URI,a,C>
} | {
    pure: <A,a>(a:A) => Kind2<URI,a,A>,
    app:<A,B,a>(ff:Kind2<URI,a,(a:A)=>B>,fa:Kind2<URI,a,A>) => Kind2<URI,a,B>
}
export const Applicative2 = defun(<A extends URIs2>(minimal:Applicative2Minimal<A> & Dependencies<{Functor:typeof Functor2<A>}>) => {
    const pure = minimal.pure
    const liftA2 = "liftA2" in minimal ? minimal.liftA2 : <a,b,c,$a>(f:(a:a,b:b)=>c,fa:Kind2<A,$a,a>,fb:Kind2<A,$a,b>): Kind2<A,$a,c> => {
        const ff = minimal.$deps.Functor.fmap(a=>(b:b)=>f(a,b),fa)
        return app(ff,fb)
    }

    const leftArrow = <a,b,$a>(fa:Kind2<A,$a,a>,fb:Kind2<A,$a,b>) => {
        return liftA2((a,b)=>a,fa,fb)
    }
    const rightArrow = <a,b,$a>(fa:Kind2<A,$a,a>,fb:Kind2<A,$a,b>) => {
        return liftA2((a,b)=>b,fa,fb)
    }

    const app = "app" in minimal ? minimal.app : <a,b,$a>(ff:Kind2<A,$a,(a:a)=>b>,fa:Kind2<A,$a,a>) => {
        return liftA2((a,b)=>a(b),ff,fa)
    }
    return {
        pure,
        app,
        liftA2,
        leftArrow,
        rightArrow
    }
})

export type Applicative3Minimal<URI extends URIs3> = {
    pure: <A,a,b>(a:A) => Kind3<URI,a,b,A>,
    liftA2:<A,B,C,a,b>(f:(a:A,b:B)=>C,fa:Kind3<URI,a,b,A>,fb:Kind3<URI,a,b,B>) => Kind3<URI,a,b,C>
} | {
    pure: <A,a,b>(a:A) => Kind3<URI,a,b,A>,
    app:<A,B,a,b>(ff:Kind3<URI,a,b,(a:A)=>B>,fa:Kind3<URI,a,b,A>) => Kind3<URI,a,b,B>
}
export const Applicative3 = defun(<A extends URIs3>(minimal:Applicative3Minimal<A> & Dependencies<{Functor:typeof Functor3<A>}>) => {
    const pure = minimal.pure
    const liftA2 = "liftA2" in minimal ? minimal.liftA2 : <a,b,c,$a,$b>(f:(a:a,b:b)=>c,fa:Kind3<A,$a,$b,a>,fb:Kind3<A,$a,$b,b>): Kind3<A,$a,$b,c> => {
        const ff = minimal.$deps.Functor.fmap(a=>(b:b)=>f(a,b),fa)
        return app(ff,fb)
    }

    const leftArrow = <a,b,$a,$b>(fa:Kind3<A,$a,$b,a>,fb:Kind3<A,$a,$b,b>) => {
        return liftA2((a,b)=>a,fa,fb)
    }
    const rightArrow = <a,b,$a,$b>(fa:Kind3<A,$a,$b,a>,fb:Kind3<A,$a,$b,b>) => {
        return liftA2((a,b)=>b,fa,fb)
    }

    const app = "app" in minimal ? minimal.app : <a,b,$a,$b>(ff:Kind3<A,$a,$b,(a:a)=>b>,fa:Kind3<A,$a,$b,a>) => {
        return liftA2((a,b)=>a(b),ff,fa)
    }
    return {
        pure,
        app,
        liftA2,
        leftArrow,
        rightArrow
    }
})