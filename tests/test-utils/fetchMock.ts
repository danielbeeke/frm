import fs from 'fs'
const originalFetch = window.fetch

export const fetch = async (url, options) => {
  if (url.startsWith('/')) {
    url = url.replace('.js', '.ts')

    const fileSystemLink = `${__dirname}/../../src${url}`
    if (fs.existsSync(fileSystemLink)) {
      const file = fs.readFileSync(fileSystemLink, 'utf-8')
      return {
        text: () => new Promise(resolve => {
          resolve(file)
        })
      }  
    }
  }

  return originalFetch(url, options)
}