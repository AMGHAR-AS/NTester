import {it, NTester} from "../app/NTester.js";

const test = new NTester('Example', {
    project: 'NTester',
    version: '1.0',
    author: 'AAS',
    comment: 'This is an example',
    lastUpdate: '04/12/2024'
})

const sTest1 = new NTester('SubTest', {
    section: 'SubTest 1',
    type: 'Example',
    version: '1.0',
    author: 'AAS',
    comment: 'This is an Sub Test example',
    lastUpdate: '04/12/2024'
})

sTest1.addStep('step1', function () {
    it(88).number().and.equal(88)
    it(88).number().and.equal(88)
    it(88).number().and.equal(88)
    it.message('A test executed..')
}, {
    name: "Step 1 - test",
    author: 'AAS',
    comment: 'This is an Step Test example',
    lastUpdate: '04/12/2024'
})

test.addSubTest(sTest1)

test.run().console()