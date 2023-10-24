import express from "express"
import {
  createEvaluation,
  getEvaluation,
  getEvaluations,
  updateEvaluation,
  createEvaluees,
} from "../../controllers/admin/evaluations_controller"

const router = express.Router()

router.get("/", getEvaluations)
router.post("/create", createEvaluation)
router.get("/:id", getEvaluation)
router.put("/:id/update", updateEvaluation)
router.post("/:id/evaluees", createEvaluees)

export default router
