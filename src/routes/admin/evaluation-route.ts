import express from "express"
import * as EvaluationController from "../../controllers/admin/evaluation-controller"

const router = express.Router()

router.patch("/set-for-evaluations", EvaluationController.setForEvaluations)

router.get("/", EvaluationController.index)
router.patch("/:id", EvaluationController.update)

export default router
