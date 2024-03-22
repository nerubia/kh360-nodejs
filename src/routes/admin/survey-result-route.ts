import express from "express"
import * as SurveyResultsController from "../../controllers/admin/survey-results-controller"

const router = express.Router()

router.get("/all", SurveyResultsController.all)

router.post("/", SurveyResultsController.store)
router.post("/:id/send-reminder", SurveyResultsController.sendReminder)

export default router
