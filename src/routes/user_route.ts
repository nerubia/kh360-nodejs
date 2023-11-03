import express from "express"
import { logout } from "../controllers/user/logout_controller"
import {
  getProfile,
  sendSampleMail,
  submitAnswer,
} from "../controllers/user/user_controller"

const router = express.Router()

router.post("/evaluations/:id/submit-answer", submitAnswer)

// TODO: Refactor
router.get("/profile", getProfile)
router.get("/mail", sendSampleMail)
router.post("/logout", logout)

export default router
