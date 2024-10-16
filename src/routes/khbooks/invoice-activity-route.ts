import express from "express"
import * as InvoiceActivityController from "../../controllers/khbooks/invoice-activity-controller"

const router = express.Router()

router.get("/", InvoiceActivityController.index)

export default router
