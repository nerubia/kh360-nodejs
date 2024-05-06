import express from "express"
import * as AnswerOptionController from "../../controllers/user/answer-option-controller"

const router = express.Router()

router.get("/active", AnswerOptionController.active)

export default router
