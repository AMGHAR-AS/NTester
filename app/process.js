import {NTester} from "./NTester.js";
import logger from "./logger.js";
import { getPluginManager } from "./plugins/PluginManager.js";

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

    process.i.run = async function () {
        const pluginManager = getPluginManager();

        // Hook: Before run
        await pluginManager.executeHook('onBeforeRun', process);

        async function runSTest(sProcess) {
            // Hook: Before test
            await pluginManager.executeHook('onBeforeTest', sProcess);

            async function runStep(step) {
                engine.current.step = step

                // Hook: Before step
                await pluginManager.executeHook('onBeforeStep', step);

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

                // Wait for step to complete
                await step.pending;

                // Hook: After step
                await pluginManager.executeHook('onAfterStep', step);
            }

            engine.current.sTest = sProcess;
            for (let i=0; i<sProcess.steps.length; i++) {
                await runStep(sProcess.steps[i])
            }

            // Hook: After test
            await pluginManager.executeHook('onAfterTest', sProcess);
        }

        engine.current.test = process;
        for (let i=0; i<process.subTests.length; i++) {
            await runSTest(process.subTests[i])
        }

        // Hook: After run
        await pluginManager.executeHook('onAfterRun', process);

        return this
    }

    process.i.console = async function () {
        const pluginManager = getPluginManager();

        // Hook: Report generation
        await pluginManager.executeHook('onReport', process);

        logger.generateLog(process).consoleOutput()
        return this
    }

    // Initialize plugins with context
    process.i.initPlugins = async function () {
        const pluginManager = getPluginManager();
        const context = {
            NTester,
            engine,
            logger,
            process
        };
        await pluginManager.initAll(context);
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