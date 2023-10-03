import express, { type Application } from "express"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import cors from "cors"

import homeRoute from "./routes/home_route"

const app: Application = express()

app.use(cors({ credentials: true, origin: true }))
app.use(bodyParser.json({ limit: "5mb" }))
app.use(cookieParser())

declare global {
  namespace Express {
    interface Request {
      user: unknown
    }
  }
}

app.use("/", homeRoute)

export default app
