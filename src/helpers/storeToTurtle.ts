import { Store, Writer } from 'n3'

export const storeToTurtle = async (store: Store) => {
  return new Promise((resolve, reject) => {
    const writer = new Writer()
    writer.addQuads(store.getQuads(null, null, null, null))
    writer.end((error, result) => {
      if (result) resolve(result)
      if (error) reject(error)
    })  
  })
}