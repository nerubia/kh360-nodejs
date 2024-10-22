import express from "express"
import * as CompanyController from "../../controllers/admin/company-controller"

const router = express.Router()

router.get("/:id", CompanyController.show)

export default router
