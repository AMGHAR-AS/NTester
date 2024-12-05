export function getDateStr() {
    const date = new Date();
    let str = ''+date.getDay();
    if (date.getDay()<10) {
        str = '0'+str
    }
    if (date.getMonth()+1<10) {
        str += '/0'+(date.getMonth()+1)
    } else {
        str += '/' + (date.getMonth() + 1)
    }
    return str+'/'+date.getFullYear()
}
export function generateText(length, options) {
    if (typeof options !== 'object') {
        options = {
            uppercase: true,
            lowercase: true,
            numeric: true,
            symbol: false,
            firstChar: false,
        };
    }
    let result = '';
    let firstChar = '';
    let characters = '';

    const charactersLowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const charactersUpperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersNumeric = '0123456789';
    const charactersSymbol = '.+-*/=_-()#~&^$:;,!?%@[]{}<>';

    if (options?.uppercase) {
        characters += charactersUpperCase;
        firstChar += charactersUpperCase;
    }

    if (options?.lowercase) {
        characters += charactersLowerCase;
        firstChar += charactersLowerCase;
    }

    if (options?.numeric) {
        characters += charactersNumeric;
    }

    if (options?.symbol) {
        characters += charactersSymbol;
    }

    if (options?.firstChar) {
        firstChar = firstChar || charactersLowerCase
        result += firstChar.charAt(Math.floor(Math.random() * firstChar.length));
    }

    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function objectRepresenting(obj, test) {
    if (test) {
        return Object.prototype.toString.call(obj) === Object.prototype.toString.call(test);
    }
    return Object.prototype.toString.call(obj);
}

export function isLikeArray(target, noPrimitive) {
    if (Array.isArray(target) || (typeof target === "string") && !noPrimitive) {
        return true
    }
    if (typeof target === "object") {
        return (Number.isSafeInteger(target.length) && ((target.length >= 0) && (target.hasOwnProperty(target.length - 1) || (target.length === 0))));
    }
    return false
}

export function isNodeList(element) {
    return (objectRepresenting(element, "[object NodeList]"))
};

export function isHTMLCollection(element) {
    return (objectRepresenting(element, "[object HTMLCollection]"))
};

export function isPlainObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

export function objectHas(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}

export function isObject(object) {
    function getPrototypes(object) {
        if (Object.getPrototypeOf) {
            return !!Object.getPrototypeOf(object);
        } else if (typeof ({}).__proto__ === 'object') {
            return !!object.__proto__;
        } else {
            let constructor = object.constructor;
            if (objectHas(object, 'constructor')) {
                let oldConstructor = constructor;
                if (!(delete object.constructor)) {
                    return false;
                }
                constructor = object.constructor;
                object.constructor = oldConstructor;
            }
            if (constructor) {
                return !!constructor.prototype;
            }
            return false;
        }
    }

    if (object && (typeof object === 'object') && !Array.isArray(object)) {
            let prototypes = getPrototypes(object);
            return (!prototypes || prototypes && !getPrototypes(prototypes));
    }
    return false;
}


export function isClass(target) {
    const isCtorClass = target.constructor
        && target.constructor.toString().substring(0, 5) === 'class'
    if(target.prototype === undefined) {
        return !!isCtorClass
    }
    const isPrototypeCtorClass = target.prototype.constructor
        && target.prototype.constructor.toString
        && target.prototype.constructor.toString().substring(0, 5) === 'class'
    return !!(isCtorClass || isPrototypeCtorClass)
}

export function isInstance(target) {
    return (target && (typeof target === "object") && (typeof target.constructor === "object") && (target instanceof target.constructor))
}

export function isEmptyString(target, noSpace) {
    if (noSpace) {
        target = target.replace(/[\r\n\t\f\v\s\uFEFF\xA0][\r\n\t\f\v\s\uFEFF\xA0]+/g, ' ');
    }
    return !target
}

export function isInstanceOf(target, ref) {
    if (isInstance(target)) {
        if (target instanceof ref) {
            return true
        } else {
            if (target.constructor.name === ref.name) {
                return true
            }
        }
    }
    return false
}

export function isEqual(target, ref) {
    if (target === ref) {
        return true;
    } else {
        const test = (obj1, obj2) => {
            if (Object.prototype.toString.call(obj1) === Object.prototype.toString.call(obj2)) {
                if (isObject(obj1) || Array.isArray(obj1)) {
                    if (!isEqual(obj1, obj2)) {
                        return true;
                    }
                } else if (obj1 !== obj2) {
                    return true;
                }
                return false;
            } else {
                return true;
            }
        };
        if (Array.isArray(target)) {
            if (Array.isArray(ref)) {
                if (target.length === ref.length) {
                    for (let i = 0; i < target.length; i++) {
                        if (test(target[i], ref[i])) return false;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else if (isObject(target) && isObject(ref)) {
            if (Object.keys(target).length === Object.keys(ref).length) {
                for (let i in target) {
                    if (test(target[i], ref[i])) return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
        return true;
    }
}

export function isContain(container, target) {
        if (Array.isArray(container)) {
            for (let i=0; i<container.length; i++) {
                if (isEqual(container[i], target)) {
                    return true;
                }
            }
        } else if (typeof container === "object") {
            for (let i in container) {
                if (isEqual(container[i], target)) {
                    return true;
                }
            }
        } else if (typeof container === "string") {
            return (container.indexOf(target) > -1)
        }

        return false;
}

