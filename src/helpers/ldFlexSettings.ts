import { defaultHandlers } from 'ldflex'
import defaultIterationHandlers from '@ldflex/async-iteration-handlers'

export default {
  ...defaultHandlers,
  ...defaultIterationHandlers,
  term: (pathData) => pathData.subject
}