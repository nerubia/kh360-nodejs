import express from "express"
import * as CurrencyController from "../../controllers/khbooks/currency-controller"

const router = express.Router()

router.get("/", CurrencyController.index)

export default router
