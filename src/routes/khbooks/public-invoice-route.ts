import express from "express"
import * as InvoiceController from "../../controllers/khbooks/invoice-controller"

const router = express.Router()

router.get("/:token", InvoiceController.getInvoiceByToken)

export default router
