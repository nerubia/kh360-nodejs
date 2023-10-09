import express from "express"
import { logout } from "../controllers/user/logout_controller"
import { getProfile, sendSampleMail } from "../controllers/user/user_controller"

const router = express.Router()

router.get("/profile", getProfile)
router.get("/mail", sendSampleMail)
router.post("/logout", logout)

export default router
