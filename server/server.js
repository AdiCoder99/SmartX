import express from 'express'
import admin from 'firebase-admin'
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' }
import { getAllUsers } from './controllers/userController.js'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})
const db = admin.firestore()
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/users', getAllUsers)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
