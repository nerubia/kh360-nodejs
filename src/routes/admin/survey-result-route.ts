import express from "express"
import * as SurveyResultsController from "../../controllers/admin/survey-results-controller"

const router = express.Router()

router.get("/all", SurveyResultsController.all)

router.post("/", SurveyResultsController.store)

export default router
