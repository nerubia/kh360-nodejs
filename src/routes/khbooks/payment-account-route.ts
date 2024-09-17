import express from "express"
import * as PaymentAccountController from "../../controllers/khbooks/payment-account-controller"

const router = express.Router()

router.get("/", PaymentAccountController.index)

export default router
