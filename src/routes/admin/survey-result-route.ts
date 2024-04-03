import express from "express"
import * as SurveyResultController from "../../controllers/admin/survey-results-controller"

const router = express.Router()

router.get("/all", SurveyResultController.all)

router.post("/", SurveyResultController.store)
router.get("/by-respondent", SurveyResultController.showResultsBySurveyAdmin)
router.get("/by-answer", SurveyResultController.showResultsByAnswer)
router.post("/:id/reopen", SurveyResultController.reopen)
router.post("/:id/send-reminder", SurveyResultController.sendReminder)
router.delete("/:id", SurveyResultController.destroy)

export default router
