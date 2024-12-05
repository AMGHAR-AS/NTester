## NTester JS
Simple JavaScript Testing Library.


## Table of Contents

- [Example](#example)
- [Guide](#guide)
- [License](#license)
  
## Example

File exampleTest.js

```javascript
import {it, NTester} from "app/NTester.js";

const test = new NTester('TestName', {
    project: 'project_name', 
    version: '1.0',
    author: 'AAS',
    comment: 'This is an example',
    lastUpdate: '04/12/2024'
})

const sTest1 = new NTester('SubTestName1', {
    section: 'SubTest Section Name',
    type: 'An Example',
    version: '1.0',
    author: 'AAS',
    comment: 'This is an Sub Test example',
    lastUpdate: '04/12/2024'
})

sTest1.addStep('step1', function () {
    it(88).number().and.equal(88) //ok
    it('88').number().and.equal(88) //not ok
    it('88').number().and.equal(88).or.string().and.equal('88') //ok
    it(promiseFunction()).promise().and.resolve.array().and.equal([1,2,3,4])
    it.message('test 1 executed..')
}, {
    name: "Step 1 - test",
    author: 'AAS',
    comment: 'This is an Step Test example',
    lastUpdate: '04/12/2024'
})



test.addSubTest(sTest1)

test.run().console()

```


```bash
node exampleTest.js
```

## Guide

```javascript
import {it} from "app/NTester.js";
```

```javascript
subTest.addStep('step', function () {

    it(100).number().and.integer().and.equal(100).or.float()
    it('100').stringNumber().and.stringFloat().or.stringNumber().stringInteger()
    it(100).greaterThan(10).or.lessThan(200).or.greaterThanOrEqual(11).or.lessThanOrEqual(199)

    it(callback).function()
    it(subTest).class().or.instance().and.instanceOf(NTester)

    it(text).string(true/*notEmpty*/)
    it(text).emptyString(true/*removeSpace*/)

    it(varname).defined().and.length(14) //number, string, array, object
    it(varname).primitive() //string, number, boolean, symbol

    it(promiseFunction()).promise().and.resolve.or.reject.nan().or.null().or.undefined()
    it(error).throw()
    it(b).bool().and.true().or.false()
    it(o).plainObject()
    it(o).object()
    it(s).symbole()
    it(a).array().or.likeArray()

    it(node).node().and.elementNode().or.textNode().or.documentNode().or.nodeList().or.htmlCollection()

    it(text).match(/\s\S/)

    it({1: 't', 2: 2}).equal({1: 't', 2: 2}) //ok
    it(1).notEqual(2)

    it([1, 2, 3, 4]).contain(4)

    it(true).false().and.default().and.true() //ok

    it(1).equal(1).and.nothing()

    it.message('message..')
})
```

## License

NTester is [MIT licensed](./LICENSE).