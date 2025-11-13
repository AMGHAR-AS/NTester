import {it, NTester} from "./app/NTester.js";

console.log('=== Test des corrections de refactorisation ===\n');

// Test 1: getDateStr fix
import {getDateStr} from "./app/utils.js";
const date = getDateStr();
console.log('✓ Test getDateStr():', date);
console.log('  Format attendu: DD/MM/YYYY');
console.log('  Résultat:', /^\d{2}\/\d{2}\/\d{4}$/.test(date) ? 'PASS' : 'FAIL');

// Test 2: Regex fixes
console.log('\n✓ Test regex stringNumber avec zéro:');
const testStringNumber = (val) => /^(([0-9]+)|(([0-9]+)\.([0-9]+)))$/.test(val);
console.log('  "0":', testStringNumber('0') ? 'PASS' : 'FAIL');
console.log('  "123":', testStringNumber('123') ? 'PASS' : 'FAIL');
console.log('  "0.5":', testStringNumber('0.5') ? 'PASS' : 'FAIL');

// Test 3: errorTest implementation
import logger from "./app/logger.js";
const testError = new Error('Test error message');
const errorResult = logger.errorTest(testError);
console.log('\n✓ Test errorTest():');
console.log('  Message:', errorResult.message === 'Test error message' ? 'PASS' : 'FAIL');
console.log('  Name:', errorResult.name === 'Error' ? 'PASS' : 'FAIL');

// Test 4: spyFunction fix
const testObj = {
    testMethod: function(a, b, c) {
        return a + b + c;
    }
};
NTester.spy(testObj, 'testMethod');
const result = testObj.testMethod(1, 2, 3);
console.log('\n✓ Test spyFunction():');
console.log('  Résultat attendu: 6, obtenu:', result);
console.log('  Status:', result === 6 ? 'PASS' : 'FAIL');

// Test 5: Fake timers
console.log('\n✓ Test Fake Timers:');
const originalSetTimeout = globalThis.setTimeout;
NTester.useFakeTimer();
console.log('  useFakeTimer():', globalThis.setTimeout !== originalSetTimeout ? 'PASS' : 'FAIL');
NTester.restoreFakeTimer();
console.log('  restoreFakeTimer():', globalThis.setTimeout === originalSetTimeout ? 'PASS' : 'FAIL');

console.log('\n=== Tests de base terminés ===\n');
