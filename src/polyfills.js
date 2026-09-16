// Runtime shims for features Next 16's runtime uses that Safari < 15.4 lacks.
// Syntax is handled by browserslist; these cover the remaining API gaps.

if (!Object.hasOwn) {
  Object.hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)
}

if (!Array.prototype.at) {
  Array.prototype.at = function (index) {
    const i = Math.trunc(index) || 0
    return this[i < 0 ? this.length + i : i]
  }
}

if (typeof structuredClone !== 'function') {
  globalThis.structuredClone = (value) => JSON.parse(JSON.stringify(value))
}
