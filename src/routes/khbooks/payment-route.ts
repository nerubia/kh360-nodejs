import express from "express"
import * as PaymentController from "../../controllers/khbooks/payment-controller"

const router = express.Router()

router.get("/", PaymentController.index)

export default router
