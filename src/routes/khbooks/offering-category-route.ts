import express from "express"
import * as OfferingCategoryController from "../../controllers/khbooks/offering-category-controller"

const router = express.Router()

router.get("/", OfferingCategoryController.index)

export default router
