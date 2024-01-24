import express from "express"
import * as ProjectSkillController from "../../controllers/admin/project-skill-controller"

const router = express.Router()

router.get("/", ProjectSkillController.index)

export default router
