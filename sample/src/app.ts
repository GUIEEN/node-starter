import bodyParser from 'body-parser'
import express from 'express'
import morgan from 'morgan'
import configuration from './configuration'

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Setup morgan for logger
const loggerFormat =
  '[:date[web]] ":method :url" :status :res[content-length] - :response-time ms'
app.use(
  morgan(loggerFormat, {
    skip (req, res) {
      return res.statusCode < 400
    },
    stream: process.stderr
  })
)
app.use(
  morgan(loggerFormat, {
    skip (req, res) {
      return res.statusCode >= 400
    },
    stream: process.stdout
  })
)

app.listen(configuration.port, () =>
  console.log(`✅ Server is running on port ${configuration.port}`)
)
