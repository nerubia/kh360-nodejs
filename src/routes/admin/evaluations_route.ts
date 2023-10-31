import express from "express"
import {
  index,
  setForEvaluation,
} from "../../controllers/admin/evaluations_controller"

const router = express.Router()

router.get("/", index)
router.patch("/:id/set-for-evaluation", setForEvaluation)

export default router
