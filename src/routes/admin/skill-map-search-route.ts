import express from "express"
import * as SkillMapSearchController from "../../controllers/admin/skill-map-search-controller"
const router = express.Router()

router.get("/", SkillMapSearchController.index)

export default router
