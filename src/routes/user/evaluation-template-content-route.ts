import express from "express"
import * as EvaluationTemplateContentController from "../../controllers/user/evaluation-template-content-controller"

const router = express.Router()

router.get("/", EvaluationTemplateContentController.index)
router.delete("/:id", EvaluationTemplateContentController.destroy)
router.put("/:id", EvaluationTemplateContentController.update)

export default router
