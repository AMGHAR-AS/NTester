import {getDateStr} from "./utils.js";
import {init} from "./process.js";
import {spyFunction} from "./spies.js";
import tester from "./tester.js";

export const it = tester;

let fTimeout;

export class NTester {
    static spy(context, callName) {
        spyFunction(context, callName)
    }

    static useFakeTimer = function () {
        if (!fTimeout) {
            fTimeout = globalThis.setTimeout
        }
        return NTester
    }

    static restoreFakeTimer = function () {
        if (!fTimeout) {
            fTimeout = globalThis.setTimeout
        }
        return NTester
    }
    
    static fn = function () {
        const fn = {
            fn: eval('function fn() {}')
        }
        NTester.spy(fn, 'fn')
        return fn.fn
    }
    
    constructor(name, params = {}) {
        init(this, {
            n: name || '',
            s: params.section || '',
            t: params.type || '',
            p: params.project || '',
            c: params.comment || '',
            v: params.version || '1.0',
            a: Array.isArray(params.authors)?params.authors:[params.author || ''],
            u: params.lastUpdate || getDateStr()
        })
    }
}

