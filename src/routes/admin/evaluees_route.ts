import express from "express"
import {
  deleteEvaluee,
  getEvaluationTemplates,
  getEvaluees,
  show,
} from "../../controllers/admin/evaluees_controller"

const router = express.Router()

router.get("/", getEvaluees)
router.get("/:id", show)
router.delete("/:id", deleteEvaluee)
router.get("/:id/templates", getEvaluationTemplates)

export default router
