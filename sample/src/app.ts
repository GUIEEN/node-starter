import bodyParser from 'body-parser'
import express from 'express'
import configuration from './configuration'

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.listen(configuration.port, () =>
  console.log(`✅ Server is running on port ${configuration.port}`)
)
