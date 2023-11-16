import express from "express"
import * as EvaluationTemplateController from "../../controllers/admin/evaluation-template-controller"

const router = express.Router()

router.get("/", EvaluationTemplateController.index)

export default router
