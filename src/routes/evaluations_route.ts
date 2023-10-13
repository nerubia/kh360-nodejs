import express from "express"
import {
  createEvaluation,
  getEvaluation,
  getEvaluations,
} from "../controllers/user/evaluations_controller"

const router = express.Router()

router.get("/", getEvaluations)
router.post("/create", createEvaluation)
router.get("/:id", getEvaluation)

export default router
