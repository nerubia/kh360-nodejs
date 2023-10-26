import express from "express"
import {
  deleteEvaluationResult,
  getEvaluationTemplates,
  index,
  show,
} from "../../controllers/admin/evaluation_results_controller"

const router = express.Router()

router.get("/", index)
router.get("/:id", show)
router.delete("/:id", deleteEvaluationResult)

// TODO: Refactor
router.get("/:id/templates", getEvaluationTemplates)

export default router
