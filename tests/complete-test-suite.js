import {it, NTester} from "../app/NTester.js";
import {getDateStr} from "../app/utils.js";

// ============================================================================
// SUITE DE TESTS COMPLÈTE POUR NTESTER
// Tests progressifs et validés
// ============================================================================

const mainTest = new NTester('NTester Test Suite', {
    project: 'NTester',
    version: '0.1.0',
    author: 'NTester Team',
    comment: 'Suite complète de tests unitaires',
    lastUpdate: '13/11/2025'
})

// ============================================================================
// 1. TESTS DES TYPES PRIMITIFS
// ============================================================================

const primitiveTests = new NTester('Primitive Types', {
    section: 'Type Assertions',
    type: 'Unit Tests',
    version: '1.0',
    author: 'Test Suite',
    comment: 'Tests des types primitifs',
    lastUpdate: '13/11/2025'
})

primitiveTests.addStep('numbers', function () {
    it(42).number()
    it(42).number().and.equal(42)
    it(3.14).float()
    it(100).integer()
    it(0).number()
    it(-5).integer()
    it(NaN).nan()
    it.message('✓ Numbers OK')
}, {name: "Numbers", author: 'Test', lastUpdate: '13/11/2025'})

primitiveTests.addStep('strings', function () {
    it('hello').string()
    it('hello').string(true)
    it('').emptyString()
    it('test').length(4)
    it('123').stringNumber()
    it('0').stringNumber()
    it('42').stringInteger()
    it('3.14').stringFloat()
    it('0.5').stringFloat()
    it.message('✓ Strings OK')
}, {name: "Strings", author: 'Test', lastUpdate: '13/11/2025'})

primitiveTests.addStep('booleans', function () {
    it(true).bool().and.true()
    it(false).bool().and.false()
    it(1).true()
    it(0).false()
    it.message('✓ Booleans OK')
}, {name: "Booleans", author: 'Test', lastUpdate: '13/11/2025'})

primitiveTests.addStep('null_undefined', function () {
    it(null).null()
    it(undefined).undefined()
    let x = 42
    it(x).defined()
    it.message('✓ Null/Undefined OK')
}, {name: "Null/Undefined", author: 'Test', lastUpdate: '13/11/2025'})

// ============================================================================
// 2. TESTS DES OBJETS ET STRUCTURES
// ============================================================================

const objectTests = new NTester('Objects and Arrays', {
    section: 'Struct Assertions',
    type: 'Unit Tests',
    version: '1.0',
    author: 'Test Suite',
    comment: 'Tests des objets et tableaux',
    lastUpdate: '13/11/2025'
})

objectTests.addStep('arrays', function () {
    it([1, 2, 3]).array()
    it([1, 2, 3]).length(3)
    it([1, 2, 3]).contain(2)
    it([]).array().and.length(0)
    it.message('✓ Arrays OK')
}, {name: "Arrays", author: 'Test', lastUpdate: '13/11/2025'})

objectTests.addStep('objects', function () {
    const obj = {a: 1, b: 2}
    it(obj).object()
    it(obj).plainObject()
    it(obj).length(2)
    it(obj).equal({a: 1, b: 2})
    it({}).length(0)
    it.message('✓ Objects OK')
}, {name: "Objects", author: 'Test', lastUpdate: '13/11/2025'})

objectTests.addStep('functions_classes', function () {
    function fn() {}
    class TestClass {}
    const instance = new TestClass()

    it(fn).function()
    it(TestClass).class()
    it(instance).instance()
    it(instance).instanceOf(TestClass)
    it.message('✓ Functions/Classes OK')
}, {name: "Functions/Classes", author: 'Test', lastUpdate: '13/11/2025'})

// ============================================================================
// 3. TESTS DES OPÉRATEURS LOGIQUES
// ============================================================================

const logicTests = new NTester('Logical Operators', {
    section: 'Logic Assertions',
    type: 'Unit Tests',
    version: '1.0',
    author: 'Test Suite',
    comment: 'Tests des opérateurs logiques',
    lastUpdate: '13/11/2025'
})

logicTests.addStep('and_operator', function () {
    it(42).number().and.integer()
    it('hello').string().and.length(5)
    it([1, 2, 3]).array().and.length(3)
    it.message('✓ AND OK')
}, {name: "AND", author: 'Test', lastUpdate: '13/11/2025'})

logicTests.addStep('or_operator', function () {
    it(42).string().or.number()
    it('42').string().or.number()
    it(100).equal(100).or.equal(200)
    it.message('✓ OR OK')
}, {name: "OR", author: 'Test', lastUpdate: '13/11/2025'})

logicTests.addStep('not_operator', function () {
    it(42).not.string()
    it('text').not.number()
    it(null).not.undefined()
    it.message('✓ NOT OK')
}, {name: "NOT", author: 'Test', lastUpdate: '13/11/2025'})

// ============================================================================
// 4. TESTS DES COMPARAISONS
// ============================================================================

const comparisonTests = new NTester('Comparisons', {
    section: 'Comparison Assertions',
    type: 'Unit Tests',
    version: '1.0',
    author: 'Test Suite',
    comment: 'Tests des comparaisons',
    lastUpdate: '13/11/2025'
})

comparisonTests.addStep('equality', function () {
    it(42).equal(42)
    it('hello').equal('hello')
    it([1, 2, 3]).equal([1, 2, 3])
    it({a: 1}).equal({a: 1})
    it(42).notEqual(43)
    it.message('✓ Equality OK')
}, {name: "Equality", author: 'Test', lastUpdate: '13/11/2025'})

comparisonTests.addStep('numeric_comparisons', function () {
    it(100).greaterThan(50)
    it(50).lessThan(100)
    it(100).greaterThanOrEqual(100)
    it(50).lessThanOrEqual(50)
    it.message('✓ Numeric comparisons OK')
}, {name: "Numeric", author: 'Test', lastUpdate: '13/11/2025'})

comparisonTests.addStep('contains', function () {
    it([1, 2, 3]).contain(2)
    it('hello world').contain('world')
    it({a: 1, b: 2}).contain(1)
    it.message('✓ Contains OK')
}, {name: "Contains", author: 'Test', lastUpdate: '13/11/2025'})

comparisonTests.addStep('regex', function () {
    it('hello123').match(/[a-z]+[0-9]+/)
    it('test@email.com').match(/[\w.-]+@[\w.-]+\.\w+/)
    it.message('✓ Regex OK')
}, {name: "Regex", author: 'Test', lastUpdate: '13/11/2025'})

// ============================================================================
// 5. TESTS DES PROMESSES
// ============================================================================

const promiseTests = new NTester('Promises', {
    section: 'Async Testing',
    type: 'Unit Tests',
    version: '1.0',
    author: 'Test Suite',
    comment: 'Tests des promesses',
    lastUpdate: '13/11/2025'
})

promiseTests.addStep('resolved_promises', function () {
    it(Promise.resolve(42)).promise().and.resolve.number().and.equal(42)
    it(Promise.resolve([1, 2, 3])).promise().and.resolve.array().and.length(3)
    it(Promise.resolve({a: 1})).promise().and.resolve.object()
    it.message('✓ Promises OK')
}, {name: "Resolved Promises", author: 'Test', lastUpdate: '13/11/2025'})

// ============================================================================
// 6. TESTS DES SPIES
// ============================================================================

const spyTests = new NTester('Spies', {
    section: 'Advanced Features',
    type: 'Unit Tests',
    version: '1.0',
    author: 'Test Suite',
    comment: 'Tests des spies',
    lastUpdate: '13/11/2025'
})

spyTests.addStep('spy_basic', function () {
    const obj = {
        add: function(a, b) { return a + b }
    }
    NTester.spy(obj, 'add')
    it(obj.add(5, 3)).equal(8)
    it.message('✓ Spy OK')
}, {name: "Basic Spy", author: 'Test', lastUpdate: '13/11/2025'})

spyTests.addStep('mock_function', function () {
    const mockFn = NTester.fn()
    it(mockFn).function()
    it.message('✓ Mock OK')
}, {name: "Mock Function", author: 'Test', lastUpdate: '13/11/2025'})

// ============================================================================
// 7. TESTS DES UTILITAIRES
// ============================================================================

const utilTests = new NTester('Utilities', {
    section: 'Utils Testing',
    type: 'Unit Tests',
    version: '1.0',
    author: 'Test Suite',
    comment: 'Tests des utilitaires',
    lastUpdate: '13/11/2025'
})

utilTests.addStep('date_utility', function () {
    const dateStr = getDateStr()
    it(dateStr).string()
    it(dateStr).match(/^\d{2}\/\d{2}\/\d{4}$/)
    it.message('✓ Date utility OK')
}, {name: "Date Utility", author: 'Test', lastUpdate: '13/11/2025'})

utilTests.addStep('primitives', function () {
    it('text').primitive()
    it(42).primitive()
    it(true).primitive()
    it.message('✓ Primitives OK')
}, {name: "Primitives", author: 'Test', lastUpdate: '13/11/2025'})

// ============================================================================
// 8. TESTS DES CAS LIMITES
// ============================================================================

const edgeTests = new NTester('Edge Cases', {
    section: 'Edge Testing',
    type: 'Unit Tests',
    version: '1.0',
    author: 'Test Suite',
    comment: 'Tests des cas limites',
    lastUpdate: '13/11/2025'
})

edgeTests.addStep('zeros', function () {
    it(0).number().and.integer()
    it('0').stringNumber().and.stringInteger()
    it.message('✓ Zeros OK')
}, {name: "Zeros", author: 'Test', lastUpdate: '13/11/2025'})

edgeTests.addStep('empties', function () {
    it('').emptyString()
    it([]).length(0)
    it({}).length(0)
    it.message('✓ Empties OK')
}, {name: "Empties", author: 'Test', lastUpdate: '13/11/2025'})

edgeTests.addStep('negatives', function () {
    it(-42).integer().and.lessThan(0)
    it(-3.14).float()
    it.message('✓ Negatives OK')
}, {name: "Negatives", author: 'Test', lastUpdate: '13/11/2025'})

// ============================================================================
// ASSEMBLAGE ET EXÉCUTION
// ============================================================================

mainTest.addSubTest(primitiveTests)
mainTest.addSubTest(objectTests)
mainTest.addSubTest(logicTests)
mainTest.addSubTest(comparisonTests)
mainTest.addSubTest(promiseTests)
mainTest.addSubTest(spyTests)
mainTest.addSubTest(utilTests)
mainTest.addSubTest(edgeTests)

console.log('\n🚀 Démarrage de la suite de tests NTester...\n')
mainTest.run().console()
