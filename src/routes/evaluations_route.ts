import express from "express"
import {
  createEvaluation,
  getEvaluations,
} from "../controllers/user/evaluations_controller"

const router = express.Router()

router.get("/", getEvaluations)
router.post("/create", createEvaluation)

export default router
