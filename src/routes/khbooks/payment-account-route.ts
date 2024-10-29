import express from "express"
import * as PaymentAccountController from "../../controllers/khbooks/payment-account-controller"

const router = express.Router()

router.get("/", PaymentAccountController.index)
router.get("/:id", PaymentAccountController.show)
router.delete("/:id", PaymentAccountController.destroy)

export default router
