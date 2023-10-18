import express from "express"
import {
  createEvaluation,
  getEvaluation,
  getEvaluations,
  setEvaluators,
} from "../../controllers/admin/evaluations_controller"

const router = express.Router()

router.get("/", getEvaluations)
router.post("/create", createEvaluation)
router.get("/:id", getEvaluation)
router.post("/:id/set-evaluators", setEvaluators)

export default router
