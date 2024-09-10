import express from "express"
import * as TaxTypeController from "../../controllers/khbooks/tax-type-controller"

const router = express.Router()

router.get("/", TaxTypeController.index)

export default router
