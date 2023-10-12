import express from "express"
import { createEvaluation } from "../controllers/user/evaluations_controller"

const router = express.Router()

router.post("/create", createEvaluation)

export default router
