import express from "express"
import { getDefaultEmailTemplate } from "../../controllers/admin/email-template-controller"

const router = express.Router()

router.get("/default", getDefaultEmailTemplate)

export default router
