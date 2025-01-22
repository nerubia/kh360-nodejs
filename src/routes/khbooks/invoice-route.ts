import express from "express"
import * as InvoiceController from "../../controllers/khbooks/invoice-controller"
import { uploadMiddleware } from "../../middlewares/upload-middleware"

const router = express.Router()

router.get("/", InvoiceController.index)
router.get("/latest", InvoiceController.getNextInvoiceNo)
router.post("/", uploadMiddleware.array("files"), InvoiceController.store)
router.get("/:id", InvoiceController.show)
router.put("/:id", uploadMiddleware.array("files"), InvoiceController.update)
router.delete("/:id", InvoiceController.destroy)

router.post(
  "/:id/attachments",
  uploadMiddleware.array("files"),
  InvoiceController.uploadAttachments
)
router.post("/:id/send", InvoiceController.send)
router.post("/:id/send-reminder", InvoiceController.sendReminder)
router.post("/:id/status", InvoiceController.updateStatus)
router.post("/:id/duplicate", InvoiceController.duplicate)
router.post("/:id/download", InvoiceController.download)
router.post("/:id/cancel", InvoiceController.cancel)
router.post("/:id/send-test-email", InvoiceController.sendTestEmail)

router.get("/:id/link", InvoiceController.getLink)

router.post(
  "/send-batch-invoice",
  uploadMiddleware.array("files"),
  InvoiceController.sendBatchInvoice
)

export default router
