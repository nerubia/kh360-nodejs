import express from "express"
import * as SkillMapSearchController from "../../controllers/admin/skill-map-search-controller"
const router = express.Router()

router.get("/", SkillMapSearchController.index)
router.get("/my-skill-map/:id", SkillMapSearchController.getSingleLatestSkillMap)
export default router
