import express from "express"
import * as InvoiceActivityController from "../../controllers/khbooks/invoice-activity-controller"

const router = express.Router()

router.get("/:token", InvoiceActivityController.captureAndShow)

export default router
