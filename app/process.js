import {NTester} from "./NTester.js";
import logger from "./logger.js";

export const engine = {
    tests: [],
    process: [],
    current: {
        test: null,
        sTest: null,
        step: null,
    }
}

function initMainTest(process) {
    process.subTests = [];
    process.i.addSubTest = function (st) {
        if (st instanceof NTester) {
            const index = engine.tests.indexOf(st);
            process.subTests.push(engine.process[index])
        }
        return this
    }

    process.i.run = function () {
        function runSTest(sProcess) {
            function runStep(step) {
                engine.current.step = step
                try {
                    step.call();
                    for (let i=0; i<step.log.length; i++) {
                        step.log[i] = step.log[i]()
                    }
                    step.pending = new Promise((resolve) => {
                        Promise.all(step.log).then((log) => {
                            step.log = log
                            resolve()
                        }).catch((e) => {
                            step.log = [false];
                            step.error = logger.errorTest(e)
                            resolve()
                        })
                    })
                } catch (e) {
                    step.log = [false];
                    step.error = logger.errorTest(e)
                }
            }
            engine.current.sTest = sProcess;
            for (let i=0; i<sProcess.steps.length; i++) {
                runStep(sProcess.steps[i])
            }
        }
        engine.current.test = process;
        for (let i=0; i<process.subTests.length; i++) {
            runSTest(process.subTests[i])
        }
        return this
    }

    process.i.console = function () {
        logger.generateLog(process).consoleOutput()
        return this
    }
}

function initSubTest(process) {
    process.steps = [];
    process.i.addStep = function (name, callback, params) {
        const step = {
            n: name, call: callback, log: [], msg: [], error: false, index: process.steps.length,
            c: params.comment,
            a: Array.isArray(params.authors)?params.authors:[params.author || ''],
            u: params.lastUpdate || ''
        }
        process.steps.push(step)
        return this
    }
}

export function init(instance, params) {
    const process = {
        ...params,
        i: instance,
    }

    engine.tests.push(instance)
    engine.process.push(process)

    if (process.p) {
        initMainTest(process)
    } else {
        initSubTest(process)
    }
}