import express from "express"
import * as ContractController from "../../controllers/khbooks/contract-controller"

const router = express.Router()

router.get("/", ContractController.index)

export default router
