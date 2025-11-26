const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('home.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(router)

// 拦截非 GET 请求，直接拒绝
server.use((req, res, next) => {
  if (req.method !== 'GET') {
    return res.status(403).json({ error: 'Read-only API' })
  }
  next()
})

server.use(router)

const PORT = 53000
server.listen(PORT, () => {
  console.log('JSON Server is running on port', PORT)
})
