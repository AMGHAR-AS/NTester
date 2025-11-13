# Bug Fix: default() ne vidait pas correctement pending

## 🐛 Bug Découvert Lors des Tests

Pendant la création de la suite de tests complète, un nouveau bug critique a été découvert dans la fonction `default()`.

### Problème

**Localisation**: `app/tester.js:334` (fonction `default()`)

**Code bugué**:
```javascript
default: function () {
    for (let i=0; i<pending.length; i++) {
        pending.pop()
    }
    pending.push(() => true)
    ...
}
```

**Symptôme**: L'expression évaluée contenait des éléments résiduels, générant des expressions invalides comme `"truetrue&&false"` au lieu de `"true&&true"`.

### Analyse

La boucle `for` est incorrecte :
- À chaque itération, `i` augmente
- À chaque `pop()`, `pending.length` diminue
- La condition `i < pending.length` devient rapidement fausse
- Résultat : seulement la moitié des éléments sont supprimés

**Exemple** :
Si `pending = [func1, 'and', func2]` (length = 3):
- i=0, length=3, pop() → length=2
- i=1, length=2, pop() → length=1
- i=2, length=1, **condition 2<1 est fausse, arrêt !**
- Résultat : `pending = [func1]` au lieu de `[]`

### Solution

**Code corrigé**:
```javascript
default: function () {
    pending.length = 0  // Clear the array efficiently
    pending.push(() => true)
    ...
}
```

### Impact

**Avant correction** :
```javascript
it(false).false().and.default().and.true()
// pending après default() : [func_false, () => true, 'and', func_true]
// Expression générée : "truetrue&&false" ❌
```

**Après correction** :
```javascript
it(false).false().and.default().and.true()
// pending après default() : [() => true, 'and', func_true]
// Expression générée : "true&&true" ✅
```

### Tests

Le bug a été découvert et corrigé lors de la création de la suite de tests complète :
- **Test de régression** : `tests/complete-test-suite.js`
- **Tous les tests** : ✅ PASS

---

**Date de découverte** : 13/11/2025
**Sévérité** : 🔴 Critique
**Status** : ✅ Corrigé
