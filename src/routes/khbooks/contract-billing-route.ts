import express from "express"
import * as ContractBillingController from "../../controllers/khbooks/contract-billing-controller"

const router = express.Router()

router.get("/", ContractBillingController.index)

export default router
