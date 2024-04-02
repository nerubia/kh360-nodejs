import express from "express"
import * as SurveyTemplateController from "../../controllers/admin/survey-template-controller"

const router = express.Router()

router.get("/all", SurveyTemplateController.getAllSurveyTemplates)

export default router
