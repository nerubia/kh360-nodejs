import express from "express"
import * as EvaluationTemplateController from "../../controllers/admin/evaluation-template-controller"

const router = express.Router()

router.get("/active", EvaluationTemplateController.active)
router.get("/template-types", EvaluationTemplateController.getTemplateTypes)

router.get("/", EvaluationTemplateController.index)
router.post("/", EvaluationTemplateController.store)
router.get("/:id", EvaluationTemplateController.show)
router.put("/:id", EvaluationTemplateController.update)
router.delete("/:id", EvaluationTemplateController.destroy)

router.get("/", EvaluationTemplateController.index)
router.post("/", EvaluationTemplateController.store)
router.get("/:id", EvaluationTemplateController.show)
router.put("/:id", EvaluationTemplateController.update)
router.delete("/:id", EvaluationTemplateController.destroy)

export default router
