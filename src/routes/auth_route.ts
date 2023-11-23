import express from "express"
import { login } from "../controllers/auth/login_controller"
import { loginWithGoogle } from "../controllers/auth/login_with_google"
import {
  getExternalUserStatus,
  loginAsExternalUser,
  resendCode,
} from "../controllers/auth/login-as-external-user-controller"
import { refreshToken } from "../controllers/auth/refresh_token_controller"

const router = express.Router()

router.post("/login", login)
router.post("/login/google", loginWithGoogle)
router.post("/login/external-user", loginAsExternalUser)
router.post("/login/external-user/resend-code", resendCode)
router.get("/login/external-user/status", getExternalUserStatus)
router.get("/refresh", refreshToken)

export default router
