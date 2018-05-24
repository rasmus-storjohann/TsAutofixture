import { Autofixture } from '../src/index';

var autofixture: Autofixture;
beforeEach(() => {
  autofixture = new Autofixture();
});

describe('Autofixture', () => {
  describe('examples', () => {
    class MyDto {
      id: number;
      firstName: string;
      lastName: string;
      constructor() {
        this.id = 0;
        this.firstName = '';
        this.lastName = '';
      }
    }

    var unitUnderTest = function(value: MyDto) {
      if (value.id < 0) {
        throw Error('');
      }
      return true;
    };

    it('throws on negative id not using autofixture', () => {
      var dtoWithNegativeId = {
        id: -1, // the important bit
        firstName: 'a dummy value',
        lastName: 'another dummy value'
      };
      expect(() => {
        unitUnderTest(dtoWithNegativeId);
      }).toThrow(Error);
    });

    var template: MyDto;

    beforeEach(() => {
      template = new MyDto();
    });

    it('throws on negative id with autofixture', () => {
      var dtoWithNegativeId = autofixture.create(template, {
        id: 'integer < 0'
      });
      expect(() => {
        unitUnderTest(dtoWithNegativeId);
      }).toThrow(Error);
    });

    it('accepts zero id with autoautofixture', () => {
      var dtoWithZeroId = autofixture.create(template);
      dtoWithZeroId.id = 0;
      expect(unitUnderTest(dtoWithZeroId)).toBeTruthy();
    });
  });

  describe('static functions', () => {
    it('should create boolean', () => {
      expect(Autofixture.createBoolean()).toEqual(expect.any(Boolean));
    });
    it('should create string', () => {
      expect(Autofixture.createString()).toEqual(expect.any(String));
    });
    it('should create string of given length', () => {
      expect(Autofixture.createString(10)).toEqual(expect.any(String));
    });
    it('should create a number', () => {
      expect(Autofixture.createNumber()).toEqual(expect.any(Number));
    });
    it('should create a number above a limit', () => {
      expect(Autofixture.createNumberAbove(0)).toEqual(expect.any(Number));
    });
    it('should create a number below a limit', () => {
      expect(Autofixture.createNumberBelow(0)).toEqual(expect.any(Number));
    });
    it('should create an integer in a range', () => {
      expect(Autofixture.createNumberBetween(0, 1)).toEqual(expect.any(Number));
    });
    it('should create an integer above a limit', () => {
      expect(Autofixture.createIntegerAbove(0)).toEqual(expect.any(Number));
    });
    it('should create an integer below a limit', () => {
      expect(Autofixture.createIntegerBelow(0)).toEqual(expect.any(Number));
    });
    it('should create an integer in a range', () => {
      expect(Autofixture.createIntegerBetween(0, 1)).toEqual(expect.any(Number));
    });
  });

  class SimpleClass {
    public flag: boolean;
    public value: number;
    public name: string;
    constructor() {
      this.flag = true;
      this.name = '';
      this.value = 1;
    }
  }

  var simpleTemplate: SimpleClass;
  beforeEach(() => {
    simpleTemplate = new SimpleClass();
  });

  it('can create without spec', () => {
    var value = autofixture.create(simpleTemplate);
    expect(value.flag).toEqual(expect.any(Boolean));
    expect(value.value).toEqual(expect.any(Number));
    expect(value.name).toEqual(expect.any(String));
  });

  it('can create with partial spec', () => {
    var value = autofixture.create(simpleTemplate, {
      value: 'number > 5'
    });
    expect(value.value).toEqual(expect.any(Number));
    expect(value.value).toBeGreaterThan(5);
    expect(value.name).toEqual(expect.any(String));
  });

  it('does not modify argument object', () => {
    simpleTemplate.name = 'name';

    autofixture.create(simpleTemplate);

    expect(simpleTemplate.name).toEqual('name');
  });

  describe('can create nested objects', () => {
    class ClassWithNestedClass {
      public label: string;
      public nested: SimpleClass;
      constructor() {
        this.label = '';
        this.nested = new SimpleClass();
      }
    }

    var templateWithNestedClass: ClassWithNestedClass;
    beforeEach(() => {
      templateWithNestedClass = new ClassWithNestedClass();
    });

    it('without spec', () => {
      var value = autofixture.create(templateWithNestedClass);
      expect(value.label).toEqual(expect.any(String));
      expect(value.nested.flag).toEqual(expect.any(Boolean));
      expect(value.nested.value).toEqual(expect.any(Number));
      expect(value.nested.name).toEqual(expect.any(String));
    });

    it('with nested spec', () => {
      var value = autofixture.create(templateWithNestedClass, {
        nested: {
          name: 'string[5]'
        }
      });
      expect(value.nested.name).toEqual(expect.any(String));
      expect(value.nested.name).toHaveLength(5);
    });
  });

  describe('can create object with nested array of primitives', () => {
    class ClassWithNestedPrimitiveArray {
      public label: string;
      public nestedArray: number[];
      constructor() {
        this.label = '';
        this.nestedArray = [0];
      }
    }
    var templateWithNestedPrimitiveArray: ClassWithNestedPrimitiveArray;
    beforeEach(() => {
      templateWithNestedPrimitiveArray = new ClassWithNestedPrimitiveArray();
    });

    it('creates several values in nested array', () => {
      var value = autofixture.create(templateWithNestedPrimitiveArray);
      expect(value.nestedArray).toBeInstanceOf(Array);
      expect(value.nestedArray).toEqual(value.nestedArray);
    });

    it('create values of the expected type', () => {
      var value = autofixture.create(templateWithNestedPrimitiveArray);
      expect(value.nestedArray[0]).toEqual(expect.any(Number));
    });

    it('with spec applying to the array', () => {
      var value = autofixture.create(templateWithNestedPrimitiveArray, {
        nestedArray: '10 < integer < 20'
      });
      expect(value.nestedArray[0] % 1).toEqual(0);
      expect(value.nestedArray[0]).toBeGreaterThan(10);
      expect(value.nestedArray[0]).toBeLessThan(20);
    });

    it('throws on empty array', () => {
      var templateWithEmptyArray = {
        emptyArray: []
      };
      expect(() => {
        autofixture.create(templateWithEmptyArray);
      }).toThrow(/Found empty array 'emptyArray'/); // TODO better error message
    });

    it('throws on doubly nested array', () => {
      var templateWithDoublyNestedArray = {
        doublyNestedArray: [[1, 2], [3, 4]]
      };
      expect(() => {
        autofixture.create(templateWithDoublyNestedArray);
      }).toThrow(/Nested array \'doublyNestedArray\' not supported/);
    });
  });

  describe('can create object with nested array of objects', () => {
    class ClassWithNestedArray {
      public label: string;
      public nestedArray: SimpleClass[];
      constructor() {
        this.label = '';
        this.nestedArray = [simpleTemplate];
      }
    }
    var templateWithNestedArray: ClassWithNestedArray;
    beforeEach(() => {
      templateWithNestedArray = new ClassWithNestedArray();
    });

    it('creates several objects in nested array', () => {
      var value = autofixture.create(templateWithNestedArray);
      expect(value.nestedArray).toBeInstanceOf(Array);
      expect(value.nestedArray).toEqual(value.nestedArray);
    });

    it('create objects of the expected type', () => {
      var value = autofixture.create(templateWithNestedArray);
      expect(value.nestedArray[0].flag).toEqual(expect.any(Boolean));
      expect(value.nestedArray[0].value).toEqual(expect.any(Number));
      expect(value.nestedArray[0].name).toEqual(expect.any(String));
      expect(value.nestedArray[0].name).toBeDefined();
    });

    it('with spec applying to the array', () => {
      var value = autofixture.create(templateWithNestedArray, {
        nestedArray: {
          name: 'string[5]'
        }
      });
      expect(value.nestedArray[0].name).toHaveLength(5);
    });
  });

  describe('creating many', () => {
    it('returns an array of several elements', () => {
      var values = autofixture.createMany(simpleTemplate);
      expect(values).toBeInstanceOf(Array);
      expect(values).toEqual(values);
    });

    it('returns an array of the requested number of elements', () => {
      var values = autofixture.createMany(simpleTemplate, 5);
      expect(values).toBeInstanceOf(Array);
      expect(values).toHaveLength(5);
    });

    it('returns an array of the expected type', () => {
      var values = autofixture.createMany(simpleTemplate);
      expect(values[0]).toBeInstanceOf(Object);
      expect(values[0].flag).toEqual(expect.any(Boolean));
      expect(values[0].value).toEqual(expect.any(Number));
      expect(values[0].name).toEqual(expect.any(String));
    });

    it('returns an array of unique values', () => {
      var values = autofixture.createMany(simpleTemplate);
      expect(values[0].value).not.toEqual(values[1].value);
      expect(values[0].name).not.toEqual(values[1].name);
    });
    // add test that you can pass in the required number of elements
  });

  describe('creating booleans', () => {
    class ClassWithBoolean {
      public flag: boolean;
      constructor(flag: boolean) {
        this.flag = flag;
      }
    }

    it('returns a boolean', () => {
      var value = autofixture.create(new ClassWithBoolean(true), {
        flag: 'boolean'
      });
      expect(value.flag).toEqual(expect.any(Boolean));
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

  describe('creating numbers', () => {
    it('with any value', () => {
      var value = autofixture.create(templateWithNumber);
      expect(value.value).toEqual(expect.any(Number));
    });

    it('with a value above a limit', () => {
      var value = autofixture.create(templateWithNumber, {
        value: 'number > 3.2'
      });
      expect(value.value).toEqual(expect.any(Number));
      expect(value.value).toBeGreaterThan(3.2);
    });

    it('with a value below a limit', () => {
      var value = autofixture.create(templateWithNumber, {
        value: 'number < 3.2'
      });
      expect(value.value).toEqual(expect.any(Number));
      expect(value.value).toBeLessThan(3.2);
    });

    it('with a value in a range', () => {
      var value = autofixture.create(templateWithNumber, {
        value: '1.222 < number < 1.223'
      });
      expect(value.value).toEqual(expect.any(Number));
      expect(value.value).toBeGreaterThan(1.222);
      expect(value.value).toBeLessThan(1.233);
    });

    // error with <= and >=
  });

  describe('creating integers', () => {
    it('with any value', () => {
      var value = autofixture.create(templateWithNumber, {
        value: 'integer'
      });
      expect(value.value).toEqual(expect.any(Number));
      expect(value.value % 1).toEqual(0);
    });

    it('with a value above a limit', () => {
      var value = autofixture.create(templateWithNumber, {
        value: 'integer > 3'
      });
      expect(value.value).toEqual(expect.any(Number));
      expect(value.value % 1).toEqual(0);
      expect(value.value).toBeGreaterThan(3);
    });

    it('with a value below a limit', () => {
      var value = autofixture.create(templateWithNumber, {
        value: 'integer < 8'
      });
      expect(value.value).toEqual(expect.any(Number));
      expect(value.value % 1).toEqual(expect.any(Number));
      expect(value.value).toBeLessThan(8);
    });

    it('one sided spec with whitespace in spec', () => {
      var value = autofixture.create(templateWithNumber, {
        value: '  integer  <  8  '
      });
      expect(value.value).toEqual(expect.any(Number));
    });

    it('with a value in a range', () => {
      var value = autofixture.create(templateWithNumber, {
        value: '4 < integer < 8'
      });
      expect(value.value).toEqual(expect.any(Number));
      expect(value.value % 1).toEqual(0);
      //expect(value.value).to.be.within(5, 7);
    });

    it('two sided range with white space in spec', () => {
      var value = autofixture.create(templateWithNumber, {
        value: '  4  <  integer  <  8  '
      });
      expect(value.value).toEqual(expect.any(Number));
    });
  });

  it('shoud skip a field that is marked skip', () => {
    var value = autofixture.create(templateWithNumber, {
      value: 'skip'
    });
    expect(value.value).toBeUndefined();
  });

  describe('creating strings', () => {
    class ClassWithString {
      public name: string;
      constructor() {
        this.name = '';
      }
    }
    var templateWithString: ClassWithString;
    beforeEach(() => {
      templateWithString = new ClassWithString();
    });

    it('with default length', () => {
      var value = autofixture.create(templateWithString);
      expect(value.name).toEqual(expect.any(String));
      expect(value.name).toBeDefined();
    });

    it('with a given length', () => {
      var value = autofixture.create(templateWithString, {
        name: 'string[5]'
      });
      expect(value.name).toEqual(expect.any(String));
      expect(value.name).toHaveLength(5);
    });

    it('with white space in spec', () => {
      var value = autofixture.create(templateWithString, {
        name: ' string [ 5 ] '
      });
    });
  });

  describe('handling errors', () => {
    it('of misspelled field', () => {
      expect(() => {
        autofixture.create(simpleTemplate, {
          naem: 'string'
        });
      }).toThrow(/field \'naem\' that is not in the type/);
    });

    it('on wrong type in spec', () => {
      expect(() => {
        autofixture.create(simpleTemplate, {
          name: 'number'
        });
      }).toThrow(/\'number\' not compatible with type \'string\'/);
    });

    var expectToThrowOnInvalidStringSpec = function(invalidSpec: string, expected: string) {
      var expectedToThrow = () => {
        autofixture.create(simpleTemplate, {
          name: invalidSpec
        });
      };
      expect(expectedToThrow).toThrow(expected);
    };

    var expectToThrowOnInvalidNumberSpec = function(invalidSpec: string, expected: string) {
      var expectedToThrow = () => {
        autofixture.create(templateWithNumber, {
          value: invalidSpec
        });
      };
      expect(expectedToThrow).toThrow(expected);
    };

    it('on invalid specs', () => {
      expectToThrowOnInvalidStringSpec('string[]', "Invalid string autofixture spec: 'string[]'");
      expectToThrowOnInvalidStringSpec('string[5', "Invalid string autofixture spec: 'string[5'");
      expectToThrowOnInvalidStringSpec('string 5]', "Invalid string autofixture spec: 'string 5]'");
      expectToThrowOnInvalidStringSpec('string[5.3]', "Invalid string autofixture spec: 'string[5.3]'");
      expectToThrowOnInvalidStringSpec('sting', "AutoFixture spec 'sting' not compatible with type 'string'");

      expectToThrowOnInvalidNumberSpec('number 5', "Invalid number autofixture spec: 'number 5'");
      expectToThrowOnInvalidNumberSpec('number <= 5', "Invalid number autofixture spec: 'number <= 5'");
      expectToThrowOnInvalidNumberSpec('number >= 5', "Invalid number autofixture spec: 'number >= 5'");
      expectToThrowOnInvalidNumberSpec('3 > number > 4', "Invalid number autofixture spec: '3 > number > 4'");
      expectToThrowOnInvalidNumberSpec('number >', "Invalid number autofixture spec: 'number >'");
      expectToThrowOnInvalidNumberSpec('number <', "Invalid number autofixture spec: 'number <'");
      expectToThrowOnInvalidNumberSpec('1 < number <', "Invalid number autofixture spec: '1 < number <'");
      expectToThrowOnInvalidNumberSpec('3 < number < 2', 'Lower bound 3 must be lower than upper bound 2');

      expectToThrowOnInvalidNumberSpec('integer < 5.5', 'Invalid integer autofixture spec contains real value: 5.5');
      expectToThrowOnInvalidNumberSpec('integer > 5.5', 'Invalid integer autofixture spec contains real value: 5.5');
      expectToThrowOnInvalidNumberSpec(
        '1 < integer < 5.5',
        'Invalid integer autofixture spec contains real value: 5.5'
      );
      expectToThrowOnInvalidNumberSpec(
        '1.1 < integer < 5',
        'Invalid integer autofixture spec contains real value: 1.1'
      );
      expectToThrowOnInvalidNumberSpec('integer 5', "Invalid number autofixture spec: 'integer 5'");
      expectToThrowOnInvalidNumberSpec('integer <= 5', "Invalid number autofixture spec: 'integer <= 5'");
      expectToThrowOnInvalidNumberSpec('integer >= 5', "Invalid number autofixture spec: 'integer >= 5'");
      expectToThrowOnInvalidNumberSpec('3 > integer > 4', "Invalid number autofixture spec: '3 > integer > 4'");
      expectToThrowOnInvalidNumberSpec('integer >', "Invalid number autofixture spec: 'integer >'");
      expectToThrowOnInvalidNumberSpec('integer <', "Invalid number autofixture spec: 'integer <'");
      expectToThrowOnInvalidNumberSpec('3 < integer < 2', 'Lower bound 3 must be lower than upper bound 2');
    });
  });
});
