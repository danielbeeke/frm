export const intersectionCount = (callback: Function | null = null) => (a: Array<any>, b: Array<any>) => {
  const result = a.filter(aItem => b.includes(aItem)).length
  if (typeof callback === 'function') return callback(result)
  return result
}
