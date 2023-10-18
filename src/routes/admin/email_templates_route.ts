import express from "express"
import { getDefaultEmailTemplate } from "../../controllers/admin/email_templates_controller"

const router = express.Router()

router.get("/default", getDefaultEmailTemplate)

export default router
