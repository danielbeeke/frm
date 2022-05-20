export let replace
export const cssClassReplacer = (cssClassReplacements: { [key: string]: string}) => {
  replace = (cssClasses: Array<string>) => {
    return cssClasses.map(cssClass => cssClassReplacements[cssClass] ?? cssClass)
  }
  return replace
}