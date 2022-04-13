export const LDflexToString = async (path) => {
  if (typeof path === 'string') return path

  const value = await path
  return value.toString()
}

export const flexify = (functionToFlexify) => {
  return async (path) => {
    const result = await LDflexToString(path)
    return functionToFlexify(result)
  }
}