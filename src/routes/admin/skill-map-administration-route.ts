import express from "express"
import * as SkillMapAdministrationController from "../../controllers/admin/skill-map-administration-controller"

const router = express.Router()

router.get("/", SkillMapAdministrationController.index)
router.get("/:id", SkillMapAdministrationController.show)
router.post("/", SkillMapAdministrationController.store)
router.post("/upload", SkillMapAdministrationController.upload)
router.put("/:id", SkillMapAdministrationController.update)
router.delete("/:id", SkillMapAdministrationController.destroy)

router.post("/:id/close", SkillMapAdministrationController.close)
router.post("/:id/cancel", SkillMapAdministrationController.cancel)
router.post("/:id/reopen", SkillMapAdministrationController.reopen)

export default router
