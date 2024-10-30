import express from "express"
import * as PaymentNetworkController from "../../controllers/khbooks/payment-network-controller"

const router = express.Router()

router.get("/", PaymentNetworkController.index)

export default router
