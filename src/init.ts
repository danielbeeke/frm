import { init as initFrmForm } from './CustomElements/FrmForm'
import { init as initFrmField } from './CustomElements/FrmField'
import { init as initFrmGrouper } from './CustomElements/FrmGrouper'
import { init as initFrmUri } from './CustomElements/FrmUri'

import defaultConfig from './defaultConfig'
import { Settings } from './types/Settings'
import './scss/styles.scss'

export const init = async (settings: Settings | null = null) => {
  if (settings === null) settings = defaultConfig

  // Ensure all the properties on the Widget classes are expanded.
  for (const widgetTypeClass of Object.values(settings.widgets))
    for (const arrayToExpand of ['supportedDataTypes', 'supportedProperties', 'requiredProperties'])
      widgetTypeClass[arrayToExpand] = widgetTypeClass[arrayToExpand].map(item => settings!.context.expandTerm(item))

  for (const grouperType of Object.values(settings.groupers))
    for (const [index, group] of grouperType['applicablePredicateGroups'].entries())
      grouperType['applicablePredicateGroups'][index] = group.map(item => settings!.context.expandTerm(item))
  
  initFrmForm(settings)
  initFrmField(settings)
  initFrmGrouper(settings)
  initFrmUri(settings)
  await settings.internationalization.init(settings)
  await settings.referenceResolver.init(settings)

  for (const [name, elementInit] of Object.entries(settings.elements)) {
    customElements.define(name, elementInit(settings))
  }
}