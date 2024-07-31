import express from "express"
import * as TestSuiteController from "../../controllers/test-suite/test-suite-controller"

const router = express.Router()

router.post("/", TestSuiteController.executeTest)

export default router
