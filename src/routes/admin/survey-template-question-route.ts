import express from "express"
import * as SurveyTemplateQuestionController from "../../controllers/admin/survey-template-question-controller"

const router = express.Router()

router.get("/all", SurveyTemplateQuestionController.all)

export default router
