import express from "express"
import {
  index,
  setForEvaluations,
} from "../../controllers/admin/evaluations_controller"

const router = express.Router()

router.get("/", index)
router.patch("/set-for-evaluations", setForEvaluations)

export default router
