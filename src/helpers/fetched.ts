/*
* Returns a fetch function wrapped with cache to be used as normal fetch
*/
export async function fetched (url, options) {
  if (options.method && options.method !== 'GET') {
    return fetch(url, options)
  }

  const cache = await caches.open('fetch')

  return cache.match(url).then(function (cached) {
    if (cached) return cached

    return fetch(url, options).then(function (response) {
      cache.put(url, response.clone())
      return Promise.resolve(response)
    })
  })
}