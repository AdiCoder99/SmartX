import express from 'express'
import admin from 'firebase-admin'
// import serviceAccount from './serviceAccountKey.json'
import { getAllUsers } from './controllers/userController.js'
import fs from 'fs';
import userRouter from './routes/userRoutes.js';



const serviceAccount = JSON.parse(
  fs.readFileSync(new URL('./serviceAccountKey.json', import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})
const db = admin.firestore()
const app = express()
app.use(express.json());
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api/users', userRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
