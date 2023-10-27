import express from "express"
import {
  deleteEvaluationResult,
  getEvaluationTemplates,
  index,
  show,
  store,
} from "../../controllers/admin/evaluation_results_controller"

const router = express.Router()

router.get("/", index)
router.post("/", store)
router.get("/:id", show)
router.delete("/:id", deleteEvaluationResult)

// TODO: Refactor
router.get("/:id/templates", getEvaluationTemplates)

export default router
