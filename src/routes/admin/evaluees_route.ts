import express from "express"
import {
  deleteEvaluee,
  getEvaluees,
} from "../../controllers/admin/evaluees_controller"

const router = express.Router()

router.get("/", getEvaluees)
router.delete("/:id", deleteEvaluee)

export default router
