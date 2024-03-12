import express from "express"
import * as SkillController from "../../controllers/admin/skill-controller"

const router = express.Router()

router.get("/", SkillController.index)
router.get("/:id", SkillController.show)
router.post("/", SkillController.store)
router.put("/:id", SkillController.update)
router.delete("/:id", SkillController.destroy)

export default router
