import express from "express"
import * as EvaluationResultController from "../../controllers/admin/evaluation-result-controller"

const router = express.Router()

router.get("/all", EvaluationResultController.all) // TODO: Refactor

router.get("/", EvaluationResultController.index)
router.post("/", EvaluationResultController.store)
router.get("/:id", EvaluationResultController.show)
router.delete("/:id", EvaluationResultController.destroy)
router.patch("/:id/set-status", EvaluationResultController.setStatus)

router.get("/:id/evaluators", EvaluationResultController.getEvaluators)

export default router
