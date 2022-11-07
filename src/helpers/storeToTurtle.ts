import { Store, Writer } from 'n3'

export const storeToTurtle = async (store: Store): Promise<string> => {
  return new Promise((resolve, reject) => {
    const writer = new Writer()
    const quads = store.getQuads(null, null, null, null)
    if (!quads.length) reject('Nothing to save')
    writer.addQuads(quads)
    writer.end((error, result) => {
      if (result) resolve(result)
      if (error) reject(error)
    })  
  })
}