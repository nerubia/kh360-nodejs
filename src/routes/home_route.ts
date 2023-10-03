import express from "express"
import { getHome } from "../controllers/home_controller"

const router = express.Router()

router.get("/", getHome)

export default router
