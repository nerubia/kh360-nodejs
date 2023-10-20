import express from "express"
import { getEvaluees } from "../../controllers/admin/evaluees_controller"

const router = express.Router()

router.get("/", getEvaluees)

export default router
