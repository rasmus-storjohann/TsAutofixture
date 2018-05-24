export interface Options {
    [key: string]: string | Options;
}
export declare class Autofixture {
    static createBoolean(): boolean;
    static createString(length?: number): string;
    static createNumber(): number;
    static createNumberBelow(upperBound: number): number;
    static createNumberAbove(lowerBound: number): number;
    static createNumberBetween(lowerBound: number, upperBound: number): number;
    static createInteger(): number;
    static createIntegerBelow(upperBound: number): number;
    static createIntegerAbove(lowerBound: number): number;
    static createIntegerBetween(lowerBound: number, upperBound: number): number;
    constructor();
    createMany<T extends Object>(template: T, count?: number, options?: Options): T[];
    create<T extends Object>(template: T, options?: Options): T;
    private throwIfOptionsContainsFieldsNotIn<T>(template, options?);
    private forEachProperty(object, callback);
    private actualTypeOfField<T>(t, name);
    private createSimpleProperty(name, type, options?);
    private optionsContain(name, options?);
    private createPrimitiveFromOptions(name, type, options);
    private throwOnIncompatibleSpec(type, spec?);
    private throwOnUnsupportedType(type);
    private createManyPrimitiveFromSpec(count, spec);
    private createPrimitiveFromSpec(spec);
    private createStringFromSpec(spec);
    private createNumberFromSpec(spec);
    private parseNumberSpec(spec);
    private parseSimpleNumericalSpec(spec);
    private parseAsOnesidedSpec(spec);
    private validateIsInteger(spec);
    private parseAsTwosidedSpec(spec);
}
