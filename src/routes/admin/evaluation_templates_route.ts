import express from "express"
import { index } from "../../controllers/admin/evaluation_templates_controller"

const router = express.Router()

router.get("/", index)

export default router
