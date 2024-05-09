export { }

// Needed or else TS starts crying
declare global {
    interface Array<T> {
        findLastIndex(
            predicate: (value: T, index: number, obj: T[]) => unknown,
            thisArg?: any
        ): number
    }
}