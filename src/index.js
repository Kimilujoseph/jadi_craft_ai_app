import { App } from "./express-app.js"
import express from "express"
import { connectWithRetry } from "./database/connection.js"
const PORT = process.env.PORT || 3001

const startServer = async () => {
    const app = express()
    await App(app)
    await connectWithRetry()
    app.listen(PORT, () => {
        console.log(`The server is listening on port ${PORT}`)
    })
}
startServer()
