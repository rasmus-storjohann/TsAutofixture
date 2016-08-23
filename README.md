# TsAutofixture

## Motivation

Autofixtures generate random data for unit tests.

If you have tests with a lot of code that is building test data, it may look something like this. Here's a test that checks than an API throws if given a DTO with a negative id.

```
it("throws on negative id not using autofixture", () => {
    var dtoWithNegativeId = {
        id: -1, // the important bit
        firstName: "a dummy value",
        lastName: "another dummy value"
    }
    chai.expect(() => {
        unitUnderTest(dtoWithNegativeId);
    }).to.throw(Error);
});
```
Autofixtures allow you to clean that up so that instead you have a test that only contains the things that you actually care about. The autofixture generates random data to populate the DTO, leaving you to only explicitly specify the aspects of the test data that are relevant to the test:
```
var fixture: Autofixture;
var template: MyDto;

beforeEach(()=>{
    fixture = new Autofixture();
    template = new MyDto();
});

it("throws on negative id with autofixture", () => {
    var dtoWithNegativeId = fixture.create(template, {
        id : "integer < 0"
    });
    chai.expect(() => {
        unitUnderTest(dtoWithNegativeId);
    }).to.throw(Error);
});

```
Because the tests run with random data, they will also give you better coverage than tests with hard-coded values. If you need to test an edge case, you can still use autofixture to create a randomly populated DTO which you can modify to meet the needs of the test:
```
it("accepts zero id", () => {
    var dtoWithZeroId = fixture.create(template);
    dtoWithZeroId.id = 0;
    chai.expect(unitUnderTest(dtoWithZeroId)).to.be.true;
});
```
## Objects
Given an object as a template, Autofixture will give you another object with the same fields of the same basic types, but populated with random values subject to constraints (see below). Members objects are recursively generated in the same way, as are arrays of objects or primitive values. The template object is not changed, typically you would reuse the template object in many tests. For example:
```
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

it("can create object", () => {
    var fixture = new Autofixture();
    var value = fixture.create(simpleTemplate);
    chai.expect(value.flag).to.be.a("boolean");
    chai.expect(value.value).to.be.a("number");
    chai.expect(value.name).to.be.a("string");
    chai.expect(value.name).to.not.be.empty;
});

```
## Arrays of objects
You can create arrays of objects by just calling `createMany` instead of `create`, and optionally pass in the nubmer of elements.
```
var fixture: Autofixture;
beforeEach(() => {
    fixture = new Autofixture();
});

it("returns an array of several elements", () => {
  var values = fixture.createMany(simpleTemplate);
  chai.expect(values).to.be.instanceOf(Array);
  chai.expect(values).to.have.length.above(1);
});

it("returns an array of the requested number of elements", () => {
  var values = fixture.createMany(simpleTemplate, 5);
  chai.expect(values).to.be.instanceOf(Array);
  chai.expect(values).to.have.lengthOf(5);
});

it("returns an array of the expected type", () => {
    var values = fixture.createMany(simpleTemplate);
    chai.expect(values[0]).to.be.instanceOf(Object);
    chai.expect(values[0].flag).to.be.a("boolean");
    chai.expect(values[0].value).to.be.a("number");
    chai.expect(values[0].name).to.be.a("string");
});

it("returns an array of unique values", () => {
    var values = fixture.createMany(simpleTemplate);
    chai.expect(values[0].value).to.not.equal(values[1].value);
    chai.expect(values[0].name).to.not.equal(values[1].name);
});

```
## Numbers
Given a DTO with a number field, Autofixture will populate that field with a random floating point value, for example
```
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

it("with any value", () => {
    var fixture = new Autofixture();
    var value = fixture.create(templateWithNumber);
    chai.expect(value.value).to.be.a("number");
});

```
This behaviour can be modifies by passing in options specifying how the field is to be populated, using e.g.

* `"number"` (generates a random real value, this is the default)
* `"number < 3.2"`
* `"number > 7.8"`
* `"24 < number < 32"` 

to specify real values in given ranges, or to get integers, use 

* `"integer"` (generates a random integer)
* `"integer < 5"`
* `"integer > 5"`
* `"16 < integer < 32"`

for example
```
it("with a value in a range", () => {
    var fixture = new Autofixture();
    var value = fixture.create(templateWithNumber, {
        value : "1.222 < number < 1.223"
    });
    chai.expect(value.value).to.be.a("number");
    chai.expect(value.value).to.be.within(1.222, 1.223);
});
```
## Strings
Strings can be generated as well
```
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
    var subject = new Autofixture();
    var value = subject.create(templateWithString);
    chai.expect(value.name).to.be.a("string");
    chai.expect(value.name).to.not.be.empty;
});
```
You can pass in the length of the string as follows
```
it("with a given length", () => {
    var fixture = new Autofixture();
    var value = fixture.create(templateWithString, {
        name : "string[5]"
    });
    chai.expect(value.name).to.be.a("string");
    chai.expect(value.name).to.have.lengthOf(5);
});
```
## Booleans
Autofixture can also generate random boolean values:
```
class ClassWithBoolean {
    public flag: boolean;
    constructor() {
        this.flag = true;
    }
}

it("returns a boolean", () => {
    var subject = new Autofixture();
    var value = subject.create(new ClassWithBoolean());
    chai.expect(value.flag).to.be.a("boolean");
});
```
## Arrays of primitives
```
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
    var fixture = new Autofixture();
    var value = fixture.create(templateWithNestedPrimitiveArray);
    chai.expect(value.nestedArray).to.be.an("Array");
    chai.expect(value.nestedArray).to.have.length.above(1);
});

```
