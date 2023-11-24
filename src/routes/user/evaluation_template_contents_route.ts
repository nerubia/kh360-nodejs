import express from "express"
import { index } from "../../controllers/user/evaluation-template-contents-controller"

const router = express.Router()

router.get("/", index)

export default router
