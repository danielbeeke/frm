const corsAnywhere = require('cors-anywhere')

let proxy = corsAnywhere.createServer({
  originWhitelist: [],
  requireHeaders: [],
  removeHeaders: [] 
});

module.exports = function (app) {
  app.use('/cors', async (req, res) => {
    req.url = req.url.replace('/cors', '')
    proxy.emit('request', req, res)
  })

  app.use('/data', async (req, res) => {
    req.url = `/https://bcp47.danielbeeke.nl/data${req.url}`
    console.log(req.url)
    proxy.emit('request', req, res)
  })
};