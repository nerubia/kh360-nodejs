import express from "express"
import * as InvoiceController from "../../controllers/khbooks/invoice-controller"

const router = express.Router()

router.get("/", InvoiceController.index)
router.post("/", InvoiceController.store)
// router.get("/:id", InvoiceController.show)
// router.put("/:id", InvoiceController.update)
router.delete("/:id", InvoiceController.destroy)

router.post("/:id/send", InvoiceController.send)
router.post("/:id/send-reminder", InvoiceController.sendReminder)
router.post("/:id/duplicate", InvoiceController.duplicate)
router.post("/:id/download", InvoiceController.download)
router.post("/:id/cancel", InvoiceController.cancel)

export default router
