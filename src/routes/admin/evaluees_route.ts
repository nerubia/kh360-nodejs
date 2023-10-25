import express from "express"
import {
  deleteEvaluee,
  getEvaluationTemplates,
  getEvaluees,
} from "../../controllers/admin/evaluees_controller"

const router = express.Router()

router.get("/", getEvaluees)
router.delete("/:id", deleteEvaluee)
router.get("/:id/templates", getEvaluationTemplates)

export default router
