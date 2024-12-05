import ConsoleAdapter from "./ConsoleAdapter.js";

const Console = new ConsoleAdapter();

function generateLog(process) {
    const log = {
        name: process.n,
        project: process.p,
        comment: process.c,
        version: process.v,
        authors: process.a,
        lastUpdate: process.u,
        messages: process.messages,
        subTests: [],
        nend: process.subTests.length
    }

    function getSTest(sProcess) {
        const sLog = {
            name: sProcess.n,
            section: sProcess.s,
            type: sProcess.t,
            comment: sProcess.c,
            version: sProcess.v,
            authors: sProcess.a,
            lastUpdate: sProcess.u,
            steps: [],
            passed: 0,
            errors: 0,
            nend: sProcess.steps.length
        }

        function getStep(step) {
            const stepLog = {
                name: step.n,
                authors: step.a,
                comment: step.c,
                lastUpdate: step.u,
                status: 'pending',
                passed: 0,
                errors: 0,
                length: step.log.length,
                messages: step.msg
            }
            sLog.steps.push(stepLog);

            step.pending.then(() => {
                stepLog.status = 'ok'
                for (let i = 0; i < step.log.length; i++) {
                    if (step.log[i] === true) {
                        stepLog.passed += 1;
                    } else {
                        stepLog.status = 'error'
                        stepLog.errors += 1;
                    }
                }
                if (step.error) {
                    stepLog.status = 'error-test';
                }

                if (stepLog.errors) {
                    sLog.errors += 1
                } else {
                    sLog.passed += 1
                }

                sLog.nend -= 1;
                if (sLog.nend === 0) {
                    log.nend -= 1

                }
            })
        }

        log.subTests.push(sLog)
        for (let i = 0; i < sProcess.steps.length; i++) {
            getStep(sProcess.steps[i])
        }
    }

    for (let i = 0; i < process.subTests.length; i++) {
        getSTest(process.subTests[i])
    }
    return {
        consoleOutput: function () {
            consoleLog(log)
        }
    }
}

function consoleLog(log, active = 'main') {
    const stList = [];

    for (let i = 0; i < log.subTests.length; i++) {
        const st = log.subTests[i];
        stList.push('#'+(i+1) +'  Test: '+ (st.name || 'Sub Test #' + i) + ' ['+(st.steps.length-st.nend)+'/'+st.steps.length+']'+' ('+((st.nend>0)?'pending)':'completed)') + '  -  passed: '+st.passed+'/'+st.steps.length+', error: '+st.errors+'/'+st.steps.length);
        const index = i;
        const stepList = [];
        const stl = [
            {type: 'clear'},
            {
                type: 'table',
                border: true,
                fit: true,
                items: [
                    ["SubTest: " + st
                        .name],
                    ["Section: " + st.section, "Version: " + st.version],
                        ["LastUpdate: " + st.lastUpdate, 'Type: ' + st.type],
                        ["Authors: " + st.authors.join(', ')],
                        ["Comment: " + st.comment],
                        ["Passed: " + st.passed +'/'+st.steps.length, 'Error: ' + st.errors+'/'+st.steps.length],
                ]
            },
            {
                type: 'list',
                items: stepList,
                singleColumn: true,
                event: function (err, res) {
                    if (!err) {
                        if (res.selectedIndex === 0) {
                            this.setConsole('main');
                            active = 'main'
                        } else {
                            this.setConsole('step_' + index + '_' + res.selectedIndex);
                            active = 'step_' + index + '_' + res.selectedIndex;
                        }
                    }
                }
            }
        ]

        stepList.push('...')
        for (let j = 0; j < st.steps.length; j++) {
            const step = st.steps[j];
            const sIndex = j+1;
            stepList.push('#'+sIndex+'  Step Test: '+ (step.name || 'Step Test #' + i)+' ('+step.status+')'  + '  -  passed: '+step.passed+'/'+step.length+', error: '+step.errors+'/'+step.length);
            const sl = [
                {type: 'clear'},
                {
                    type: 'table',
                    border: true,
                    fit: true,
                    styles: {
                    },
                    items: [
                        ["Step: " + step.name],
                        ["LastUpdate: " + step.lastUpdate],
                        ["Authors: " + step.authors.join(', ')],
                        ["Comment: " + step.comment],
                        ["Status: " + step.status],
                        ["Passed: " + step.passed +'/'+step.length],
                        [ 'Error: ' + step.errors+'/'+step.length],
                        step.messages.length?["Messages:\n"+step.messages.join('\n')]:[]
                    ],
                },
                {
                    type: 'list',
                    items: ['...'],
                    singleColumn: true,
                    event: function (err, res) {
                        if (!err) {
                            this.setConsole('ST_' + index);
                            active = 'ST_' + index;
                        }
                    }
                }
            ];
            Console.setContent('step_' + index +'_'+sIndex, sl)
        }

        Console.setContent('ST_' + index, stl)
    }

    stList.push('Exit')

    Console.setContent('main', [
        {type: 'clear'},
        {
            type: 'table',
            border: true,
            fit: true,
            styles: {
            },
            items: [
                ["NTester: " + log.name],
                ["Project: " + log.project, "Version: " + log.version],
                ["LastUpdate: " + log.lastUpdate],
                ["Authors: " + log.authors.join(', ')],
                ["Comment: " + log.comment]
            ],
        },
        {
            type: 'list',
            items: stList,
            singleColumn: true,
            event: function (err, res) {
                if (!err) {
                    if (res.selectedIndex === stList.length - 1) {
                        Console.exit()
                    } else {
                        this.setConsole('ST_' + res.selectedIndex);
                        active = 'ST_' + res.selectedIndex;
                    }
                }
            }
        }
    ])

    if (active) {
        Console.setConsole(active)
    } else {
        Console.setConsole('main')
    }
    if (log.nend) {
        setTimeout(function () {
            consoleLog(log, active)
        }, 500)
    }
}

function errorTest() {

}

const logger = {
    generateLog: generateLog,
    errorTest: errorTest
}

export default logger