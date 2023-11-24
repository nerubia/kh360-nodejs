import express from "express"
import {
  getDefaultEmailTemplate,
  getNARatingTemplates,
} from "../../controllers/admin/email-template-controller"

const router = express.Router()

router.get("/default", getDefaultEmailTemplate)
router.get("/na-rating", getNARatingTemplates)

export default router
