import express from "express"
import * as SkillController from "../../controllers/admin/skill-controller"

const router = express.Router()

router.get("/", SkillController.index)

export default router
