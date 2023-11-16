import express from "express"
import * as EvaluationController from "../../controllers/admin/evaluation-controller"

const router = express.Router()

router.get("/", EvaluationController.index)
router.patch("/set-for-evaluations", EvaluationController.setForEvaluations)

export default router
