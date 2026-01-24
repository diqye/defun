import { Eq } from "../Eq";

export const NumberEq = Eq<number>({
    equal: (a,b) => a == b
},{
    notEqual: (a,b) => a != b
})