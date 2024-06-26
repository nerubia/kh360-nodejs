import express from "express"
import * as AdminUserController from "../../controllers/admin/users-controller"

const router = express.Router()

router.get("/", AdminUserController.index)
router.get("/all", AdminUserController.getAllUsers)
router.get("/:id/skill-map", AdminUserController.getUserSkillMap)
router.get("/:id/skill-map/:skill_id", AdminUserController.getUserSkillMapBySkillId)

export default router
