import express, { type Application } from "express"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import cors from "cors"

import { type UserToken } from "./types/user_token"

import { authMiddleware } from "./middlewares/auth_middleware"
import { adminMiddleware } from "./middlewares/admin_middleware"

import homeRoute from "./routes/home_route"
import authRoute from "./routes/auth_route"
import userRoute from "./routes/user_route"
import evaluationsRoute from "./routes/evaluations_route"
import employeesRoute from "./routes/employees_route"

const app: Application = express()

app.use(cors({ credentials: true, origin: true }))
app.use(bodyParser.json({ limit: "5mb" }))
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))
app.use(cookieParser())

declare global {
  namespace Express {
    interface Request {
      user: UserToken
    }
  }
}

app.use("/", homeRoute)
app.use("/auth", authRoute)

app.use("/user", authMiddleware, userRoute)

app.use("/evaluations", adminMiddleware, evaluationsRoute)
app.use("/employees", adminMiddleware, employeesRoute)

export default app
