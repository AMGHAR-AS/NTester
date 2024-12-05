import {NTester} from "./NTester.js";

export const Spies = {
    id: [],
    callNames: [],
    contexts: [],
    originals: [],
    calls: [],
    logs:[],
    uid: 0
}

export function spyFunction(context, callName) {
    function clean(index) {
        let i = Spies.callNames.slice(index).indexOf(callName)
        if (i > -1) {
            if (Spies.contexts[i + index] === context) {
                context[callName] = Spies.originals[i + index];
                Spies.id.splice(i + index, 1)
                Spies.callNames.splice(i + index, 1)
                Spies.contexts.splice(i + index, 1)
                Spies.originals.splice(i + index, 1)
                Spies.logs.splice(i + index, 1)
            } else {
                clean(index + i + 1)
            }
        }
    }

    if (context && (typeof context[callName] === "function")) {
        clean(0)
        const id = Spies.uid++;
        const log = {c: 0, args: [], results: []}
        const oCall = context[callName]
        Spies.id.push(id)
        Spies.callNames.push(callName)
        Spies.contexts.push(context)
        Spies.originals.push(oCall)
        Spies.logs.push(log)
        context[callName] = function (...args) {
            log.c += 1;
            log.args.push(Array.from(args));
            let r;
            try {
                r = oCall.call(context, args);
            } catch (e) {
                r = e;
            }
            log.results.push(r)
            return r;
        }
        Spies.calls.push(context[callName])
    }
    return NTester
}