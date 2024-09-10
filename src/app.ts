import express, { type Application } from "express"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import cors from "cors"

import { type UserToken } from "./types/user-token-type"

import { authMiddleware } from "./middlewares/auth-middleware"
import { adminMiddleware } from "./middlewares/admin-middleware"

import homeRoute from "./routes/home-route"
import authRoute from "./routes/auth-route"
import userRoute from "./routes/user/user-route"

import answerRoute from "./routes/user/answer-route"
import answerOptionRoute from "./routes/user/answer-option-route"
import clientRoute from "./routes/admin/client-route"
import emailTemplateRoute from "./routes/admin/email-template-route"
import evaluationAdministrationRoute from "./routes/admin/evaluation-administration-route"
import evaluationResultRoute from "./routes/admin/evaluation-result-route"
import evaluationTemplateContentsRoute from "./routes/user/evaluation-template-content-route"
import ratingTemplateRoute from "./routes/user/rating-template-route"
import evaluationTemplateRoute from "./routes/admin/evaluation-template-route"
import evaluationRoute from "./routes/admin/evaluation-route"
import externalUserRoute from "./routes/admin/external-user-route"
import projectMemberRoute from "./routes/admin/project-member-route"
import projectRoleRoute from "./routes/admin/project-role-route"
import projectSkillRoute from "./routes/admin/project-skill-route"
import projectRoute from "./routes/admin/project-route"
import skillRoute from "./routes/admin/skill-route"
import skillCategoryRoute from "./routes/admin/skill-category-route"
import skillMapAdministrationRoute from "./routes/admin/skill-map-administration-route"
import skillMapResultsRoute from "./routes/admin/skill-map-result-route"
import usersRoute from "./routes/admin/users-route"
import surveyAdministrationRoute from "./routes/admin/survey-administration-route"
import surveyResultRoute from "./routes/admin/survey-result-route"
import surveyTemplateRoute from "./routes/admin/survey-template-route"
import surveyTemplateQuestionRoute from "./routes/admin/survey-template-question-route"
import skillMapSearchRoute from "./routes/admin/skill-map-search-route"

import testSuiteRoute from "./routes/test-suite/test-suite-route"
import testApiRoute from "./routes/test-suite/test-api-route"
import testItemRoute from "./routes/test-suite/test-item-route"
import testBatchRoute from "./routes/test-suite/test-batch-route"

import invoiceRoute from "./routes/khbooks/invoice-route"
import offeringCategoryRoute from "./routes/khbooks/offering-category-route"
import offeringRoute from "./routes/khbooks/offering-route"
import currencyRoute from "./routes/khbooks/currency-route"
import paymentTermRoute from "./routes/khbooks/payment-term-route"
import taxTypeRoute from "./routes/khbooks/tax-type-route"
import contractRoute from "./routes/khbooks/contract-route"
import uomRoute from "./routes/khbooks/uom-route"
import contractBillingRoute from "./routes/khbooks/contract-billing-route"
import countryRoute from "./routes/khbooks/country-route"

import morgan from "morgan"
import logger from "./utils/logger"

const app: Application = express()

const whitelist = process.env.WHITELIST !== undefined ? process.env.WHITELIST.split(",") : []

app.use(
  cors({
    credentials: true,
    origin: whitelist,
  })
)
app.use(bodyParser.json({ limit: "5mb" }))
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))
app.use(cookieParser())
app.use(
  morgan("dev", {
    stream: {
      write: (message: string) => {
        logger.info(message.trim())
      },
    },
  })
)

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
app.use("/user/rating-templates", authMiddleware, ratingTemplateRoute)
app.use("/user/evaluation-template-contents", authMiddleware, evaluationTemplateContentsRoute)
app.use("/user/answer-options", authMiddleware, answerOptionRoute)

/**
 * Admin routes
 */

app.use("/admin/answers", adminMiddleware, answerRoute)
app.use("/admin/clients", adminMiddleware, clientRoute)
app.use("/admin/email-templates", adminMiddleware, emailTemplateRoute)
app.use("/admin/evaluation-administrations", adminMiddleware, evaluationAdministrationRoute)
app.use("/admin/evaluation-results", adminMiddleware, evaluationResultRoute)
app.use("/admin/evaluation-template-contents", adminMiddleware, evaluationTemplateContentsRoute)
app.use("/admin/evaluation-templates", adminMiddleware, evaluationTemplateRoute)
app.use("/admin/evaluations", adminMiddleware, evaluationRoute)
app.use("/admin/external-users", adminMiddleware, externalUserRoute)
app.use("/admin/project-members", adminMiddleware, projectMemberRoute)
app.use("/admin/project-roles", adminMiddleware, projectRoleRoute)
app.use("/admin/project-skills", adminMiddleware, projectSkillRoute)
app.use("/admin/projects", adminMiddleware, projectRoute)
app.use("/admin/skills", adminMiddleware, skillRoute)
app.use("/admin/skill-categories", adminMiddleware, skillCategoryRoute)
app.use("/admin/skill-map-administrations", adminMiddleware, skillMapAdministrationRoute)
app.use("/admin/skill-map-results", adminMiddleware, skillMapResultsRoute)
app.use("/admin/skill-map-search", adminMiddleware, skillMapSearchRoute)
app.use("/admin/survey-administrations", adminMiddleware, surveyAdministrationRoute)
app.use("/admin/survey-results", adminMiddleware, surveyResultRoute)
app.use("/admin/survey-templates", adminMiddleware, surveyTemplateRoute)
app.use("/admin/survey-template-questions", adminMiddleware, surveyTemplateQuestionRoute)
app.use("/admin/users", adminMiddleware, usersRoute)

/**
 * Test Suite routes
 */

app.use("/test-suite", authMiddleware, testSuiteRoute)
app.use("/test-suite/apis", authMiddleware, testApiRoute)
app.use("/test-suite/items", authMiddleware, testItemRoute)
app.use("/test-suite/batches", authMiddleware, testBatchRoute)

/**
 * KH Books routes
 */

app.use("/kh-books/invoices", adminMiddleware, invoiceRoute)
app.use("/kh-books/offering-categories", adminMiddleware, offeringCategoryRoute)
app.use("/kh-books/offerings", adminMiddleware, offeringRoute)
app.use("/kh-books/currencies", adminMiddleware, currencyRoute)
app.use("/kh-books/payment-terms", adminMiddleware, paymentTermRoute)
app.use("/kh-books/tax-types", adminMiddleware, taxTypeRoute)
app.use("/kh-books/contracts", adminMiddleware, contractRoute)
app.use("/kh-books/uoms", adminMiddleware, uomRoute)
app.use("/kh-books/contract-billings", adminMiddleware, contractBillingRoute)
app.use("/kh-books/countries", adminMiddleware, countryRoute)

export default app
