import express, { type Application } from "express"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import cors from "cors"

import { type UserToken } from "./types/userTokenType"

import { authMiddleware } from "./middlewares/auth_middleware"
import { adminMiddleware } from "./middlewares/admin_middleware"

import homeRoute from "./routes/home_route"
import authRoute from "./routes/auth_route"
import userRoute from "./routes/user/user-route"

import emailTemplateRoute from "./routes/admin/email-template-route"
import evaluationAdministrationRoute from "./routes/admin/evaluation-administration-route"
import evaluationResultRoute from "./routes/admin/evaluation-result-route"
import evaluationTemplateContentsRoute from "./routes/user/evaluation_template_contents_route"
import evaluationTemplateRoute from "./routes/admin/evaluation-template-route"
import evaluationRoute from "./routes/admin/evaluation-route"
import externalUserRoute from "./routes/admin/external-user-route"
import usersRoute from "./routes/admin/users_route"

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

/**
 * User routes
 */

app.use("/user", authMiddleware, userRoute)
app.use("/user/evaluation-template-contents", authMiddleware, evaluationTemplateContentsRoute)

/**
 * Admin routes
 */

app.use("/admin/email-templates", adminMiddleware, emailTemplateRoute)
app.use("/admin/evaluation-administrations", adminMiddleware, evaluationAdministrationRoute)
app.use("/admin/evaluation-results", adminMiddleware, evaluationResultRoute)
app.use("/admin/evaluation-template-contents", adminMiddleware, evaluationTemplateContentsRoute)
app.use("/admin/evaluation-templates", adminMiddleware, evaluationTemplateRoute)
app.use("/admin/evaluations", adminMiddleware, evaluationRoute)
app.use("/admin/external-users", adminMiddleware, externalUserRoute)
app.use("/admin/users", adminMiddleware, usersRoute)

export default app
