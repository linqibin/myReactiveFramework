export * from './lang'

const hasOwnProperty = Object.prototype.hasOwnProperty;
export function hasOwn (obj : Object, key : string) {
    return hasOwnProperty.call(obj, key)
}