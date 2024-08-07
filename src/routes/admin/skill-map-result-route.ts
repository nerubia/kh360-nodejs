import express from "express"
import * as SkillMapResultController from "../../controllers/admin/skill-map-result-controller"

const router = express.Router()

router.get("/all", SkillMapResultController.all)
router.get("/filter", SkillMapResultController.filterSkillMapResult)
router.get("/latest", SkillMapResultController.latest)
router.post("/:id/result", SkillMapResultController.results)
router.post("/", SkillMapResultController.store)
router.post("/:id/reopen", SkillMapResultController.reopen)
router.post("/:id/send-reminder", SkillMapResultController.sendReminder)
router.delete("/:id", SkillMapResultController.destroy)

export default router
