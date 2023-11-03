import express from "express"
import { index } from "../../controllers/admin/evaluation_template_contents_controller"

const router = express.Router()

router.get("/", index)

export default router
