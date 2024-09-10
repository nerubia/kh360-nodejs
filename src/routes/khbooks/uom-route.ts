import express from "express"
import * as UomController from "../../controllers/khbooks/uom-controller"

const router = express.Router()

router.get("/", UomController.index)

export default router
