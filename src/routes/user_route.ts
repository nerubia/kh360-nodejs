import express from "express"
import { logout } from "../controllers/user/logout_controller"
import {
  getEvaluations,
  getProfile,
  sendSampleMail,
  submitAnswer,
  submitComment,
  submitEvaluation,
} from "../controllers/user/user_controller"

const router = express.Router()

router.get("/evaluations", getEvaluations)
router.post("/evaluations/:id/submit-answer", submitAnswer)
router.post("/evaluations/:id/submit-comment", submitComment)
router.post("/evaluations/:id/submit-evaluation", submitEvaluation)

// TODO: Refactor
router.get("/profile", getProfile)
router.get("/mail", sendSampleMail)
router.post("/logout", logout)

export default router
