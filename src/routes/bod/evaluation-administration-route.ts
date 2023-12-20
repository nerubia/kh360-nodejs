import express from "express"
import * as EvaluationAdministrationController from "../../controllers/admin/evaluation-administration-controller"

const router = express.Router()

router.get("/", EvaluationAdministrationController.index)

export default router
