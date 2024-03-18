import express from "express"
import * as SurveyTemplateRepository from "../../controllers/admin/survey-template-controller"

const router = express.Router()

router.get("/all", SurveyTemplateRepository.getAllSkillCategories)

export default router
