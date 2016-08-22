/// <reference path = "../typings/index.d.ts" />
/// <reference path = "../typings/auto.d.ts" />

import {Autofixture} from "../src/index";
import * as chai from "chai";

describe("Autofixture", () => {

    describe("examples", () => {
        class MyDto {
            id: number;
            firstName: string;
            lastName: string;
            constructor() {
            }
        }
        var unitUnderTest = function(value: MyDto) {
            if (value.id < 0) {
                throw Error("");
            }
        }
        var aDto: MyDto;
        beforeEach(()=>{
            aDto = new MyDto();
        })

        it("throws on negative id", () => {
            var dataWithNegativeId = {
                id: -1,
                firstName: "John",
                lastName: "Smith"
            }
            chai.expect(() => {
                unitUnderTest(dataWithNegativeId);
            }).to.throw(Error);
        });

        it("throws on negative id with autofixture", () => {
            var makeNegativeId = new Autofixture({
                "id" : "number < 0"
            });
            chai.expect(() => {
                unitUnderTest(makeNegativeId.create(aDto));
            }).to.throw(Error);
        });
    });

    describe("static functions", () => {

        it("should create boolean", () => {
            chai.expect(Autofixture.createBoolean()).to.be.a("boolean");
        });
        it("should create string", () => {
            chai.expect(Autofixture.createString()).to.be.a("string");
        });
        it("should create string of given length", () => {
            chai.expect(Autofixture.createString(10)).to.be.a("string");
        });
        it("should create a number", () => {
            chai.expect(Autofixture.createNumber()).to.be.a("number");
        });
        it("should create a number above a limit", () => {
            chai.expect(Autofixture.createNumberAbove(0)).to.be.a("number");
        });
        it("should create a number below a limit", () => {
            chai.expect(Autofixture.createNumberBelow(0)).to.be.a("number");
        });
        it("should create an integer in a range", () => {
            chai.expect(Autofixture.createNumberBetween(0, 1)).to.be.a("number");
        });
        it("should create an integer above a limit", () => {
            chai.expect(Autofixture.createIntegerAbove(0)).to.be.a("number");
        });
        it("should create an integer below a limit", () => {
            chai.expect(Autofixture.createIntegerBelow(0)).to.be.a("number");
        });
        it("should create an integer in a range", () => {
            chai.expect(Autofixture.createIntegerBetween(0, 1)).to.be.a("number");
        });
    });

    class SimpleClass {
        public flag: boolean;
        public value: number;
        public name: string;
        constructor() {
            this.flag = true;
            this.name = "";
            this.value = 1;
        }
    };

    var simpleTemplate: SimpleClass;
    beforeEach(() => {
        simpleTemplate = new SimpleClass();
    });

    it("can create without spec", () => {
        var subject = new Autofixture();
        var value = subject.create(simpleTemplate);
        chai.expect(value.flag).to.be.a("boolean");
        chai.expect(value.value).to.be.a("number");
        chai.expect(value.name).to.be.a("string");
    });

    it("can create with partial spec", () => {
        var subject = new Autofixture({
            "value" : "number > 5"
        });
        var value = subject.create(simpleTemplate);
        chai.expect(value.value).to.be.a("number");
        chai.expect(value.value).to.be.at.least(5);
        chai.expect(value.name).to.be.a("string");
        chai.expect(value.name).to.not.be.empty;
    });

    it("does not modify argument object", () => {
        var subject = new Autofixture();
        simpleTemplate.name = "name";

        subject.create(simpleTemplate);

        chai.expect(simpleTemplate.name).to.equal("name");
    });

    describe("can create nested objects", () => {

        class ClassWithNestedClass {
            public label: string;
            public nested: SimpleClass;
            constructor() {
                this.label = "";
                this.nested = new SimpleClass;
            }
        }

        var templateWithNestedClass: ClassWithNestedClass;
        beforeEach(() => {
            templateWithNestedClass = new ClassWithNestedClass();
        });

        it("without spec", () => {
            var subject = new Autofixture();
            var value = subject.create(templateWithNestedClass);
            chai.expect(value.label).to.be.a("string");
            chai.expect(value.nested.flag).to.be.a("boolean");
            chai.expect(value.nested.value).to.be.a("number");
            chai.expect(value.nested.name).to.be.a("string");
        });

        it("with nested spec", () => {
            var subject = new Autofixture({
                "nested" : {
                    "name" : "string[5]"
                }
            });
            var value = subject.create(templateWithNestedClass);
            chai.expect(value.nested.name).to.be.a("string");
            chai.expect(value.nested.name).to.have.lengthOf(5);
        });

    });

    describe("can create object with nested array of primitives", () => {

        class ClassWithNestedPrimitiveArray {
            public label: string;
            public nestedArray: number[];
            constructor() {
                this.label = "";
                this.nestedArray = [0];
            }
        }
        var templateWithNestedPrimitiveArray: ClassWithNestedPrimitiveArray;
        beforeEach(() => {
            templateWithNestedPrimitiveArray = new ClassWithNestedPrimitiveArray();
        });

        it("creates several values in nested array", () => {
            var subject = new Autofixture();
            var value = subject.create(templateWithNestedPrimitiveArray);
            chai.expect(value.nestedArray).to.be.an("Array");
            chai.expect(value.nestedArray).to.have.length.above(1);
        });

        it("create values of the expected type", () => {
            var subject = new Autofixture();
            var value = subject.create(templateWithNestedPrimitiveArray);
            chai.expect(value.nestedArray[0]).to.be.a("number");
        });

        it("with spec applying to the array", () => {
            var subject = new Autofixture({
                "nestedArray" : "10 < integer < 20"
            });
            var value = subject.create(templateWithNestedPrimitiveArray);
            chai.expect(value.nestedArray[0] % 1).to.equal(0);
            chai.expect(value.nestedArray[0]).to.be.within(11, 19);
        });

        it("throws on empty array", () => {
            var subject = new Autofixture();
            var templateWithEmptyArray = {
                emptyArray : []
            };
            chai.expect(() => {
                subject.create(templateWithEmptyArray);
            }).to.throw(Error, /Found empty array 'emptyArray'/);  // TODO better error message
        });

        it("throws on doubly nested array", () => {
            var subject = new Autofixture();
            var templateWithDoublyNestedArray = {
                doublyNestedArray : [[1, 2], [3, 4]]
            };
            chai.expect(() => {
                subject.create(templateWithDoublyNestedArray);
            }).to.throw(Error, /Nested array \'doublyNestedArray\' not supported/);
        });
    });

    describe("can create object with nested array of objects", () => {

        class ClassWithNestedArray {
            public label: string;
            public nestedArray: SimpleClass[];
            constructor() {
                this.label = "";
                this.nestedArray = [simpleTemplate];
            }
        }
        var templateWithNestedArray: ClassWithNestedArray;
        beforeEach(() => {
            templateWithNestedArray = new ClassWithNestedArray();
        });

        it("creates several objects in nested array", () => {
            var subject = new Autofixture();
            var value = subject.create(templateWithNestedArray);
            chai.expect(value.nestedArray).to.be.an("Array");
            chai.expect(value.nestedArray).to.have.length.above(1);
        });

        it("create objects of the expected type", () => {
            var subject = new Autofixture();
            var value = subject.create(templateWithNestedArray);
            chai.expect(value.nestedArray[0].flag).to.be.a("boolean");
            chai.expect(value.nestedArray[0].value).to.be.a("number");
            chai.expect(value.nestedArray[0].name).to.be.a("string");
            chai.expect(value.nestedArray[0].name).to.not.be.empty;
        });

        it("with spec applying to the array", () => {
            var subject = new Autofixture({
                "nestedArray" : {
                    "name" : "string[5]"
                }
            });
            var value = subject.create(templateWithNestedArray);
            chai.expect(value.nestedArray[0].name).to.have.lengthOf(5);
        });
    });

    describe("creating many", () => {
        var values : SimpleClass[];

        beforeEach(() => {
            var subject = new Autofixture();
            values = subject.createMany(simpleTemplate);
        });

        it("returns an array of several elements", () => {
            chai.expect(values).to.be.instanceOf(Array);
            chai.expect(values).to.not.be.empty; // should technically be more than one
        });

        it("returns an array of the expected type", () => {
            chai.expect(values[0]).to.be.instanceOf(Object);
            chai.expect(values[0].flag).to.be.a("boolean");
            chai.expect(values[0].value).to.be.a("number");
            chai.expect(values[0].name).to.be.a("string");
        });

        it("returns an array of unique values", () => {
            chai.expect(values[0].value).to.not.equal(values[1].value);
            chai.expect(values[0].name).to.not.equal(values[1].name);
        });
    });

    describe("creating booleans", () => {

        class ClassWithBoolean {
            public flag: boolean;
            constructor(flag: boolean) {
                this.flag = flag;
            }
        }

        it("returns a boolean", () => {
            var subject = new Autofixture({
                "flag" : "boolean"
            });
            var value = subject.create(new ClassWithBoolean(true));
            chai.expect(value.flag).to.be.a("boolean");
        });
    });

    class ClassWithNumber {
        public value: number;
        constructor() {
            this.value = 0;
        }
    }

    var templateWithNumber: ClassWithNumber;
    beforeEach(() => {
        templateWithNumber = new ClassWithNumber();
    });

    describe("creating numbers", () => {

        it("with any value", () => {
            var subject = new Autofixture({
                "value" : "number"
            });
            var value = subject.create(templateWithNumber);
            chai.expect(value.value).to.be.a("number");
        });

        it("with a value above a limit", () => {
            var subject = new Autofixture({
                "value" : "number > 3.2"
            });
            var value = subject.create(templateWithNumber);
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value).to.be.at.least(3.2);
        });

        it("with a value below a limit", () => {
            var subject = new Autofixture({
                "value" : "number < 3.2"
            });
            var value = subject.create(templateWithNumber);
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value).to.be.at.most(3.2);
        });

        it("with a value in a range", () => {
            var subject = new Autofixture({
                "value" : "1.222 < number < 1.223"
            });
            var value = subject.create(templateWithNumber);
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value).to.be.within(1.222, 1.223);
        });

        // error with <= and >=

    });

    describe("creating integers", () => {

        it("with any value", () => {
            var subject = new Autofixture({
                "value" : "integer"
            });
            var value = subject.create(templateWithNumber);
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value % 1).to.equal(0);
        });

        it("with a value above a limit", () => {
            var subject = new Autofixture({
                "value" : "integer > 3"
            });
            var value = subject.create(templateWithNumber);
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value % 1).to.equal(0);
            chai.expect(value.value).to.be.at.least(4);
        });

        it("with a value below a limit", () => {
            var subject = new Autofixture({
                "value" : "integer < 8"
            });
            var value = subject.create(templateWithNumber);
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value % 1).to.equal(0);
            chai.expect(value.value).to.be.at.most(7);
        });

        it("one sided spec with whitespace in spec", () => {
            var subject = new Autofixture({
                "value" : "  integer  <  8  "
            });
            var value = subject.create(templateWithNumber);
            chai.expect(value.value).to.be.a("number");
        });

        it("with a value in a range", () => {
            var subject = new Autofixture({
                "value" : "4 < integer < 8"
            });
            var value = subject.create(templateWithNumber);
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value % 1).to.equal(0);
            chai.expect(value.value).to.be.within(5, 7);
        });

        it("two sided range with white space in spec", () => {
            var subject = new Autofixture({
                "value" : "  4  <  integer  <  8  "
            });
            var value = subject.create(templateWithNumber);
            chai.expect(value.value).to.be.a("number");
        });
    });

    it("shoud skip a field that is marked skip", () => {
        var subject = new Autofixture({
            "value" : "skip"
        });
        var value = subject.create(templateWithNumber);
        chai.expect(value.value).to.be.undefined;
    });

    describe("creating strings", () => {

        class ClassWithString {
            public name: string;
            constructor() {
                this.name = "";
            }
        };
        var templateWithString: ClassWithString;
        beforeEach(() => {
            templateWithString = new ClassWithString();
        });

        it("with default length", () => {
            var subject = new Autofixture({
                "name" : "string"
            });
            var value = subject.create(templateWithString);
            chai.expect(value.name).to.be.a("string");
            chai.expect(value.name).to.not.be.empty;
        });

        it("with a given length", () => {
            var subject = new Autofixture({
                "name" : "string[5]"
            });
            var value = subject.create(templateWithString);
            chai.expect(value.name).to.be.a("string");
            chai.expect(value.name).to.have.lengthOf(5);
        });

        it("with white space in spec", () => {
            var subject = new Autofixture({
                "name" : " string [ 5 ] "
            });
            var value = subject.create(templateWithString);
        });
    });

    describe("handling errors", () => {
        it("of misspelled field", () => {
            var subject = new Autofixture({
                "naem" : "string"
            });
            chai.expect(() => {
                subject.create(simpleTemplate);
            }).to.throw(Error, /field \'naem\' that is not in the type/);
        });

        it("on wrong type in spec", () => {
            var subject = new Autofixture({
                "name" : "number"
            });
            chai.expect(() => {
                subject.create(simpleTemplate);
            }).to.throw(Error, /\'number\' not compatible with type \'string\'/);
        });

        var expectToThrowOnInvalidStringSpec = function(invalidSpec: string, expected: string) {
            var subject = new Autofixture({
                "name" : invalidSpec
            });
            var expectedToThrow = () => {
                subject.create(simpleTemplate);
            };
            chai.expect(expectedToThrow).to.throw(Error, expected);
        };

        var expectToThrowOnInvalidNumberSpec = function(invalidSpec: string, expected: string) {
            var subject = new Autofixture({
                "value" : invalidSpec
            });
            var expectedToThrow = () => {
                subject.create(templateWithNumber);
            };
            chai.expect(expectedToThrow).to.throw(Error, expected);
        };

        it("on invalid specs", () => {
            expectToThrowOnInvalidStringSpec("string[]", "Invalid string autofixture spec: 'string[]'");
            expectToThrowOnInvalidStringSpec("string[5", "Invalid string autofixture spec: 'string[5'");
            expectToThrowOnInvalidStringSpec("string 5]", "Invalid string autofixture spec: 'string 5]'");
            expectToThrowOnInvalidStringSpec("string[5.3]", "Invalid string autofixture spec: 'string[5.3]'");
            expectToThrowOnInvalidStringSpec("sting", "AutoFixture spec 'sting' not compatible with type 'string'");

            expectToThrowOnInvalidNumberSpec("number 5", "Invalid number autofixture spec: 'number 5'");
            expectToThrowOnInvalidNumberSpec("number <= 5", "Invalid number autofixture spec: 'number <= 5'");
            expectToThrowOnInvalidNumberSpec("number >= 5", "Invalid number autofixture spec: 'number >= 5'");
            expectToThrowOnInvalidNumberSpec("3 > number > 4", "Invalid number autofixture spec: '3 > number > 4'");
            expectToThrowOnInvalidNumberSpec("number >", "Invalid number autofixture spec: 'number >'");
            expectToThrowOnInvalidNumberSpec("number <", "Invalid number autofixture spec: 'number <'");
            expectToThrowOnInvalidNumberSpec("1 < number <", "Invalid number autofixture spec: '1 < number <'");
            expectToThrowOnInvalidNumberSpec("3 < number < 2", "Lower bound 3 must be lower than upper bound 2");

            expectToThrowOnInvalidNumberSpec("integer < 5.5", "Invalid integer autofixture spec contains real value: 5.5");
            expectToThrowOnInvalidNumberSpec("integer > 5.5", "Invalid integer autofixture spec contains real value: 5.5");
            expectToThrowOnInvalidNumberSpec("1 < integer < 5.5", "Invalid integer autofixture spec contains real value: 5.5");
            expectToThrowOnInvalidNumberSpec("1.1 < integer < 5", "Invalid integer autofixture spec contains real value: 1.1");
            expectToThrowOnInvalidNumberSpec("integer 5", "Invalid number autofixture spec: 'integer 5'");
            expectToThrowOnInvalidNumberSpec("integer <= 5", "Invalid number autofixture spec: 'integer <= 5'");
            expectToThrowOnInvalidNumberSpec("integer >= 5", "Invalid number autofixture spec: 'integer >= 5'");
            expectToThrowOnInvalidNumberSpec("3 > integer > 4", "Invalid number autofixture spec: '3 > integer > 4'");
            expectToThrowOnInvalidNumberSpec("integer >", "Invalid number autofixture spec: 'integer >'");
            expectToThrowOnInvalidNumberSpec("integer <", "Invalid number autofixture spec: 'integer <'");
            expectToThrowOnInvalidNumberSpec("3 < integer < 2", "Lower bound 3 must be lower than upper bound 2");
        });
    });
});
