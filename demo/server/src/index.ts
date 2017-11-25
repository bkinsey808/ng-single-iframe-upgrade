import * as express from 'express'
import * as path from 'path'
import * as http from 'http'

const app = express()

// static files first
app.use(
  '/ng1/',
  express.static(path.join(__dirname, '../../legacy-angularjs-project/'))
)

app.use('/', express.static(path.join(__dirname, '../../dist')))

// now rewrite
app.get('/ng1/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../legacy-angularjs-project/'))
})
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/'))
})

const server = http.createServer(app)
const port = 3000
server.listen(port, () =>
  console.log(`both modern and legacy angulars running on localhost:${port}`)
)
