import express from "express"
import * as SkillCategoryController from "../../controllers/admin/skill-category-controller"

const router = express.Router()

router.get("/", SkillCategoryController.index)

export default router
