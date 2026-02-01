import { defun, type Kind, type Kind2, type Kind3, type URIs, type URIs2, type URIs3 } from "../defun"


export type FunctorMinimal<URI extends URIs> = {
    fmap: <A,B>(f:(a:A)=>B,fa:Kind<URI,A>) => Kind<URI,B>
}
export const Functor = defun(<A extends URIs>(minimal:FunctorMinimal<A>) => {
    const fmap = minimal.fmap
    const replaceBy =<a,b>(a:a,fb:Kind<A,b>):Kind<A,a> => { 
        return fmap(() => a,fb)
    }
    return {
        fmap,
        replaceBy
    }
})
export type FunctorMinimal2<URI extends URIs2> = {
    fmap: <A,B,C>(f:(a:A)=>B,fa:Kind2<URI,C,A>) => Kind2<URI,C,B>
}
export const Functor2 = defun(<A extends URIs2>(minimal:FunctorMinimal2<A>) => {
    const fmap = minimal.fmap
    const replaceBy =<a,b,c>(a:a,fb:Kind2<A,c,b>):Kind2<A,c,a> => { 
        return fmap(() => a,fb)
    }
    return {
        fmap,
        replaceBy
    }
})

export type FunctorMinimal3<URI extends URIs3> = {
    fmap: <A,B,C,D>(f:(a:A)=>B,fa:Kind3<URI,C,D,A>) => Kind3<URI,C,D,B>
}
export const Functor3 = defun(<A extends URIs3>(minimal:FunctorMinimal3<A>) => {
    const fmap = minimal.fmap
    const replaceBy =<a,b,c,d>(a:a,fb:Kind3<A,c,d,b>):Kind3<A,c,d,a> => { 
        return fmap(() => a,fb)
    }
    return {
        fmap,
        replaceBy
    }
})