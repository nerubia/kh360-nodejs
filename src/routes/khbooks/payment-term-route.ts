import express from "express"
import * as PaymentTermController from "../../controllers/khbooks/payment-term-controller"

const router = express.Router()

router.get("/", PaymentTermController.index)

export default router
