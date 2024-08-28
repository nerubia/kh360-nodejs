import express from "express"
import * as OfferingController from "../../controllers/khbooks/offering-controller"

const router = express.Router()

router.get("/", OfferingController.index)
router.delete("/:id", OfferingController.destroy)

export default router
