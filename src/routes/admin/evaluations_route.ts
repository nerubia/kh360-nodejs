import express from "express"
import { index } from "../../controllers/admin/evaluations_controller"

const router = express.Router()

router.get("/", index)

export default router
