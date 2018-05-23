"use strict";
// can set a random number provider: https://www.npmjs.com/package/random-seed
// create arrays of basic types, e.g. integers and strings etc.
// https://lostechies.com/johnteague/2014/05/21/autofixturejs/
// support exponential values in number spec
// copy functions and prototype from template
Object.defineProperty(exports, "__esModule", { value: true });
class Autofixture {
    static createBoolean() {
        return Math.random() > 0.5;
    }
    static createString(length) {
        // TODO use random-seed or randomatic
        length = length || 10;
        var result = '';
        var buffer = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV1234567890';
        for (var i = 0; i < length; i++) {
            var offset = Math.floor(Math.random() * buffer.length);
            result += buffer[offset];
        }
        return result;
    }
    static createNumber() {
        return 1000 * Math.random();
    }
    static createNumberBelow(upperBound) {
        return upperBound - 1000 * Math.random();
    }
    static createNumberAbove(lowerBound) {
        return lowerBound + 1000 * Math.random();
    }
    static createNumberBetween(lowerBound, upperBound) {
        return lowerBound + (upperBound - lowerBound) * Math.random();
    }
    static createInteger() {
        return Math.floor(Autofixture.createNumber());
    }
    static createIntegerBelow(upperBound) {
        return Math.floor(Autofixture.createNumberBelow(upperBound));
    }
    static createIntegerAbove(lowerBound) {
        return Math.floor(Autofixture.createNumberAbove(lowerBound));
    }
    static createIntegerBetween(lowerBound, upperBound) {
        return Math.floor(Autofixture.createNumberBetween(lowerBound, upperBound));
    }
    constructor() { }
    createMany(template, count, options) {
        count = count || 3;
        var results = [];
        for (var i = 0; i < count; i++) {
            results.push(this.create(template, options));
        }
        return results;
    }
    create(template, options) {
        var result;
        var childOptions;
        var childType;
        var childSpec;
        var elementCount = 3;
        var childElementTemplate;
        this.throwIfOptionsContainsFieldsNotIn(template, options); // typo, Contain
        result = Object.assign({}, template);
        this.forEachProperty(result, (name) => {
            childType = this.actualTypeOfField(result, name);
            childOptions = options && options[name];
            childSpec = (options && options[name]) || typeof result[name][0];
            if (childSpec === 'skip') {
                delete result[name];
            }
            else if (childType === 'actualObject') {
                result[name] = this.create(result[name], childOptions);
            }
            else if (childType === 'arrayOfObjects') {
                childElementTemplate = result[name][0];
                result[name] = this.createMany(childElementTemplate, elementCount, childOptions);
            }
            else if (childType === 'arrayOfPrimitives') {
                result[name] = this.createManyPrimitiveFromSpec(elementCount, childSpec);
            }
            else {
                result[name] = this.createSimpleProperty(name, childType, options);
            }
        });
        return result;
    }
    throwIfOptionsContainsFieldsNotIn(template, options) {
        if (!options) {
            return;
        }
        this.forEachProperty(options, (name) => {
            if (!template.hasOwnProperty(name)) {
                throw Error("Autofixture specifies field '" + name + "' that is not in the type");
            }
        });
    }
    // Object.keys is better, don't pass in value
    forEachProperty(object, callback) {
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                callback(property);
            }
        }
    }
    actualTypeOfField(t, name) {
        // use node_modules/kind-of
        var field = t[name];
        var type = typeof field;
        if (typeof Array.isArray !== 'undefined' && Array.isArray(field)) {
            if (field.length === 0) {
                throw Error("Found empty array '" + name + "'");
            }
            if (Array.isArray(field[0])) {
                throw Error("Nested array '" + name + "' not supported");
            }
            return typeof field[0] === 'object' ? 'arrayOfObjects' : 'arrayOfPrimitives';
        }
        return type === 'object' ? 'actualObject' : type;
    }
    createSimpleProperty(name, type, options) {
        if (this.optionsContain(name, options)) {
            return this.createPrimitiveFromOptions(name, type, options);
        }
        this.throwOnUnsupportedType(type);
        return this.createPrimitiveFromSpec(type);
    }
    optionsContain(name, options) {
        return options && options.hasOwnProperty(name);
    }
    createPrimitiveFromOptions(name, type, options) {
        var spec = options[name];
        this.throwOnIncompatibleSpec(type, spec);
        return this.createPrimitiveFromSpec(spec);
    }
    throwOnIncompatibleSpec(type, spec) {
        var booleanOk = type === 'boolean' && spec === 'boolean';
        var stringOk = type === 'string' && /string/.test(spec);
        var numberOk = type === 'number' && /number/.test(spec);
        var integerOk = type === 'number' && /integer/.test(spec);
        if (!spec || booleanOk || stringOk || numberOk || integerOk) {
            return;
        }
        throw Error("AutoFixture spec '" + spec + "' not compatible with type '" + type + "'");
    }
    throwOnUnsupportedType(type) {
        if (type === 'boolean' ||
            type === 'string' ||
            type === 'number' ||
            type === 'actualObject' ||
            type === 'arrayOfObjects') {
            return;
        }
        throw Error("Autofixture cannot generate values of type '" + type + "'");
    }
    createManyPrimitiveFromSpec(count, spec) {
        var result = [];
        for (var i = 0; i < count; i++) {
            result.push(this.createPrimitiveFromSpec(spec));
        }
        return result;
    }
    createPrimitiveFromSpec(spec) {
        if (spec === 'boolean') {
            return Autofixture.createBoolean();
        }
        if (/string/.test(spec)) {
            return this.createStringFromSpec(spec);
        }
        if (/number/.test(spec) || /integer/.test(spec)) {
            return this.createNumberFromSpec(spec);
        }
        throw new Error("Invalid type in autofixture spec '" + spec + "'");
    }
    createStringFromSpec(spec) {
        if (spec === 'string') {
            return Autofixture.createString();
        }
        // string followed by length inside []
        var parsedString = /^\s*string\s*\[\s*(\d+)\s*\]\s*$/.exec(spec);
        if (parsedString) {
            var length = parseInt(parsedString[1], 10);
            return Autofixture.createString(length);
        }
        throw new Error("Invalid string autofixture spec: '" + spec + "'");
    }
    createNumberFromSpec(spec) {
        return this.parseNumberSpec(spec)();
    }
    parseNumberSpec(spec) {
        var parsedSpec = this.parseSimpleNumericalSpec(spec) || this.parseAsOnesidedSpec(spec) || this.parseAsTwosidedSpec(spec);
        if (parsedSpec) {
            return parsedSpec;
        }
        throw Error("Invalid number autofixture spec: '" + spec + "'");
    }
    parseSimpleNumericalSpec(spec) {
        if (spec === 'number') {
            return () => {
                return Autofixture.createNumber();
            };
        }
        if (spec === 'integer') {
            return () => {
                return Autofixture.createInteger();
            };
        }
        return undefined;
    }
    parseAsOnesidedSpec(spec) {
        // number or integer, followed by < or >, followed by a real value
        var match = /^\s*(number|integer)\s*(\>|\<)\s*(\d*\.?\d+)\s*$/.exec(spec);
        if (!match) {
            return undefined;
        }
        var isInteger = match[1] === 'integer';
        var isUpperBound = match[2] === '<';
        var limit = parseFloat(match[3]);
        if (isInteger) {
            this.validateIsInteger(match[3]);
            if (isUpperBound) {
                return () => {
                    return Autofixture.createIntegerBelow(limit);
                };
            }
            return () => {
                return Autofixture.createIntegerAbove(limit);
            };
        }
        if (isUpperBound) {
            return () => {
                return Autofixture.createNumberBelow(limit);
            };
        }
        return () => {
            return Autofixture.createNumberAbove(limit);
        };
    }
    validateIsInteger(spec) {
        var specContainsPeriod = spec.indexOf('.') >= 0;
        if (specContainsPeriod) {
            throw new Error('Invalid integer autofixture spec contains real value: ' + spec);
        }
    }
    parseAsTwosidedSpec(spec) {
        // a number, followed by <, followed by 'number' or 'integer', followed by < and another number
        var match = /^\s*(\d*\.?\d+)\s*\<\s*(integer|number)\s*\<\s*(\d*\.?\d+)\s*$/.exec(spec);
        if (!match) {
            return undefined;
        }
        var lowerBoundAsString = match[1];
        var upperBoundAsString = match[3];
        var lowerBound = parseFloat(lowerBoundAsString);
        var upperBound = parseFloat(upperBoundAsString);
        if (lowerBound >= upperBound) {
            throw Error('Lower bound ' + lowerBound + ' must be lower than upper bound ' + upperBound);
        }
        if (match[2] === 'integer') {
            this.validateIsInteger(lowerBoundAsString);
            this.validateIsInteger(upperBoundAsString);
            return () => {
                return Autofixture.createIntegerBetween(lowerBound, upperBound);
            };
        }
        return () => {
            return Autofixture.createNumberBetween(lowerBound, upperBound);
        };
    }
}
exports.Autofixture = Autofixture;
