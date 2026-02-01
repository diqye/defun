import { NumberEq } from "../Eq/NumberEq";
import { Ord } from "../Ord";

export const NumberOrd = Ord<number>({
    $deps: {
        Eq: NumberEq
    },
    compare: (a,b) => a - b
})