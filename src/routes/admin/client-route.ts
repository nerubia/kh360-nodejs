import express from "express"
import * as ClientController from "../../controllers/admin/client-controller"

const router = express.Router()

router.get("/active", ClientController.active)

export default router
