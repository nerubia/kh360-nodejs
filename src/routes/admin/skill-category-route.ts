import express from "express"
import * as SkillCategoryController from "../../controllers/admin/skill-category-controller"

const router = express.Router()

router.get("/", SkillCategoryController.index)
router.post("/", SkillCategoryController.store)
router.put("/:id", SkillCategoryController.update)
router.delete("/:id", SkillCategoryController.destroy)
router.get("/:id", SkillCategoryController.show)
export default router
