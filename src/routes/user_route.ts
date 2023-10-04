import express from "express"
import { logout } from "../controllers/user/logout_controller"

const router = express.Router()

router.post("/logout", logout)

export default router
