import express from "express"
import { login } from "../controllers/auth/login_controller"
import { loginWithGoogle } from "../controllers/auth/login_with_google"
import { refreshToken } from "../controllers/auth/refresh_token_controller"

const router = express.Router()

router.post("/login", login)
router.post("/login/google", loginWithGoogle)
router.get("/refresh", refreshToken)

export default router
