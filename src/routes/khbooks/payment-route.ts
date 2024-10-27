import express from "express"
import * as PaymentController from "../../controllers/khbooks/payment-controller"
import { uploadMiddleware } from "../../middlewares/upload-middleware"

const router = express.Router()

router.get("/", PaymentController.index)
router.post("/", uploadMiddleware.array("files"), PaymentController.store)

export default router
