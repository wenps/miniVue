export const hasOwn = (value,key)=>Object.prototype.hasOwnProperty.call(value,key)

export const isObject = (value) => {
    return value !== null && typeof value === 'object'
}

export const capitalize = (value) => {
    return 'on' + value[0].toUpperCase() + value.slice(1)
}

export * from "./toDisplayString";