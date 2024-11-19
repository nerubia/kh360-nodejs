import express from "express"
import * as PaymentController from "../../controllers/khbooks/payment-controller"
import { uploadMiddleware } from "../../middlewares/upload-middleware"

const router = express.Router()

router.get("/", PaymentController.index)
router.post("/", uploadMiddleware.array("files"), PaymentController.store)
router.get("/:id", PaymentController.show)
router.put("/:id", uploadMiddleware.array("files"), PaymentController.update)
router.post("/:id/cancel", PaymentController.cancel)

export default router
