import {engine} from "./process.js";
import {
    isClass,
    isContain,
    isEmptyString,
    isEqual, isHTMLCollection,
    isInstance,
    isInstanceOf,
    isLikeArray,
    isNodeList,
    isObject, isPlainObject
} from "./utils.js";

export default function tester(target) {
    const current = {...engine.current};
    const testProcess = {
        flags: {},
        result: false,
        p: undefined
    }
    const pending = [];

    function awaitResult() {
        return new Promise(function (resolve) {
            if (isInstanceOf(target, Promise)) {
                target.then(function (r) {
                    testProcess.flags.resolved = true
                    testProcess.p = r;
                    resolve()
                }).catch(function (r) {
                    testProcess.flags.rejected = true
                    testProcess.p = r;
                    resolve()
                })
            } else {
                testProcess.flags.resolved = true
                testProcess.p = target;
                resolve()
            }
        })
    }

    function executePile() {
        return new Promise(async function (resolve) {
            let index = 0;
            const flags = {};
            let resultFinal = []

            if (testProcess.flags.await) {
                await awaitResult();
            }

            for (; index < pending.length; index++) {
                if (pending[index] === 'not') {
                    resultFinal.push('!')
                } else if (pending[index] === 'and') {
                    resultFinal.push('&&')
                } else if (pending[index] === 'or') {
                    resultFinal.push('||')
                } else if (pending[index] === 'nand') {
                    resultFinal = Array.prototype.concat.call(resultFinal.slice(0, resultFinal.length-2), ['!('], [resultFinal[resultFinal.length-1]], '&&')
                    flags.negative = true
                } else if (pending[index] === 'nor') {
                    flags.negative = true
                    resultFinal = Array.prototype.concat.call(resultFinal.slice(0, resultFinal.length-2), ['!('], [resultFinal[resultFinal.length-1]], '||')
                } else if (pending[index] === 'resolve') {
                    if (testProcess.flags.resolved || testProcess.flags.reject) {
                        target = testProcess.p
                    } else {
                        resultFinal.push('false');
                        break;
                    }
                } else if (pending[index] === 'reject') {
                    if (testProcess.flags.rejected || testProcess.flags.resolve) {
                        target = testProcess.p
                    } else {
                        resultFinal.push('false');
                        break;
                    }
                } else {
                    resultFinal.push(''+pending[index]())
                    if (flags.negative) {
                        resultFinal.push(')')
                        flags.negative = false;
                    }
                }
            }

            resolve(eval(resultFinal.join('')||'true'))
        })
    }

    current.step.log.push(executePile)

    function check(t) {
        if (!testProcess.flags.end) {
            pending.push(t)
        }
        switch (t) {
            case 'resolve':
            case 'reject':
                if (t === 'resolve') {
                    testProcess.flags.resolve = true
                } else if (t === 'reject') {
                    testProcess.flags.reject = true
                }
                testProcess.flags.await = true
                return {
                    get not() {
                        return check('not')
                    },
                    ...testerC
                }
            case 'and':
            case 'or':
            case 'nand':
            case 'nor':
            case 'not':
                if (testProcess.flags.await) {
                    return {
                        get not() {
                            return check('not')
                        },
                        ...testerC,
                    }
                }
                return {
                    get not() {
                        return check('not')
                    },
                    get resolve() {
                        return check('resolve')
                    },
                    get reject() {
                        return check('reject')
                    },
                    ...testerC,
                }
            default:
                return {
                    get and() {
                        return check('and')
                    },
                    get or() {
                        return check('or')
                    },
                    get nand() {
                        return check('nand')
                    },
                    get nor() {
                        return check('nor')
                    },
                }
        }
    }

    const testerC = {
        nothing: function () {
            return {
                get and() {
                    return check('and')
                },
                get or() {
                    return check('or')
                },
                get nand() {
                    return check('nand')
                },
                get nor() {
                    return check('nor')
                }
            }
        },
        null: function () {
            return check(() => target === null)
        },
        undefined: function () {
            return check(() => target === undefined)
        },
        nan: function () {
            return check(() => isNaN(target))
        },
        defined: function () {
            return check(() => target !== undefined)
        },
        promise: function () {
            return check(() => target && (typeof target === "object") && (typeof target.then === "function") && (typeof target.catch === "function"))
        },
        throw: function () {
            return check(() => isInstanceOf(target, Error))
        },
        bool: function () {
            return check(() => typeof target === "boolean")
        },
        true: function () {
            return check(() => !!target)
        },
        false: function () {
            return check(() => !target)
        },
        object: function () {
            return check(() => isObject(target))
        },
        plainObject: function () {
            return check(() => isPlainObject(target))
        },
        symbol: function () {
            return check(() => typeof target === "symbol")
        },
        class: function () {
            return check(() => isClass(target))
        },
        instance: function () {
          return check(() => isInstance(target))
        },
        function: function () {
            return check((typeof target === "function") && !isClass(target))
        },
        instanceOf: function (ref) {
            return check(() => isInstanceOf(target, ref))
        },
        array: function () {
            return check(() => Array.isArray(target))
        },
        likeArray: function (noPrimitive) {
            return check(() => isLikeArray(target, noPrimitive))
        },
        string: function (noEmpty) {
            return check(() => (typeof target === "string") && ((noEmpty && !!target) || !noEmpty))
        },
        emptyString: function (removeSpace) {
            return check(() => (typeof target === "string") && isEmptyString(removeSpace))
        },
        length: function (ref) {
            if (Array.isArray(target) || (typeof target === "string")) {
                return check(() => (ref === target.length))
            } else if (typeof target === "object") {
                return check(() => Object.keys(target).length === ref)
            } else if (typeof target === "number") {
                return check(() => target.toString().replace('.', '').length === ref)
            }
        },
        stringNumber: function () {
            return check(() => (typeof target === "string") && (/^(([1-9]+)|(([1-9]+)\.([0-9]*)))$/.test(target)))
        },
        stringInteger: function () {
            return check(() => (typeof target === "string") && (/^([1-9]+)$/.test(target)))
        },
        stringFloat: function () {
            return check(() => (typeof target === "string") && (/^(([1-9]+)\.([0-9]*))$/.test(target)))
        },
        number: function () {
            return check(() => typeof target === "number")
        },
        bigInt: function () {
            return check(() => typeof target === "bigint")
        },
        integer: function () {
            return check(() => Number.isInteger(target))
        },
        float: function () {
            return check(() => !Number.isInteger(target) && Number.isFinite(target))
        },
        greaterThan: function (ref) {
            return check(() => (typeof target === "number") && (target > ref))
        },
        lessThan: function (ref) {
            return check(() => (typeof target === "number") && (target < ref))
        },
        greaterThanOrEqual: function () {
            return check(() => (typeof target === "number") && (target >= ref))
        },
        lessThanOrEqual: function (ref) {
            return check(() => (typeof target === "number") && (target <= ref))
        },
        primitive: function () {
            return check(() => (typeof target === 'string') ||
                (typeof target === 'number') ||
                (typeof target === 'boolean') ||
                (typeof target === 'symbol'));
        },
        blob: function () {
            return check(() => isInstanceOf(target, Blob))
        },
        node: function () {
            return check(() => isInstanceOf(target, Node))
        },
        elementNode: function () {
            return check(() => (isInstanceOf(target, Node)) && (target.nodeType === Node.ELEMENT_NODE))
        },
        textNode: function () {
            return check(() => (isInstanceOf(target, Node)) && (target.nodeType === Node.TEXT_NODE))
        },
        documentNode: function () {
            return check(() => (isInstanceOf(target, Node)) && (target.nodeType === Node.DOCUMENT_NODE))
        },
        nodeList: function () {
            return check(() => isNodeList(target))
        },
        htmlCollection: function () {
            return check(() => isHTMLCollection(target))
        },
        match: function (ref) {
            if (ref instanceof RegExp) {
                return check(() => ref.test(target))
            } else {
                check(() => (new RegExp(ref + '')).test(target))
            }
        },
        equal: function (ref) {
            if ((typeof target === "object") && (typeof ref === "object")) {
                return check(() => isEqual(target, ref))
            } else {
                return check(() => target === ref)
            }
        },
        notEqual: function (ref) {
            if ((typeof target === "object") && (typeof ref === "object")) {
                return check(() => !isEqual(target, ref))
            } else {
                return check(() => target !== ref)
            }
        },
        contain: function (ref) {
            return check(() => isContain(target, ref))
        },
        default: function () { //reset result
            for (let i=0; i<pending.length; i++) {
                pending.pop()
            }
            pending.push(() => true)
            return {
                get and() {
                    return check('and')
                },
                get or() {
                    return check('or')
                },
                get nand() {
                    return check('nand')
                },
                get nor() {
                    return check('nor')
                }
            }
        },
    }

    return {
        get not() {
            return check('not')
        },
        get resolve() {
            return check('resolve')
        },
        get reject() {
            return check('reject')
        },
        ...testerC
    }
}

tester.message = function (msg) {
    if (engine.current.step) {
        engine.current.step.msg.push(msg);
    }
}