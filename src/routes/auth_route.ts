import express from "express"
import { login } from "../controllers/auth/login_controller"
import { refreshToken } from "../controllers/auth/refresh_token_controller"

const router = express.Router()

router.post("/login", login)
router.get("/refresh", refreshToken)

export default router
