import express from "express"
import * as CountryController from "../../controllers/khbooks/country-controller"

const router = express.Router()

router.get("/", CountryController.index)

export default router
