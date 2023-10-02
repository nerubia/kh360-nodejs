import express, { Application, Request, Response } from "express"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import cors from "cors"

const app: Application = express()

app.use(cors({ credentials: true, origin: true }))
app.use(bodyParser.json({ limit: "5mb" }))
app.use(cookieParser())

declare global {
  namespace Express {
    interface Request {
      user: any
    }
  }
}

app.get("/", (req: Request, res: Response) => {
  res.send("ok")
})

export default app
