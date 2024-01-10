import express from "express"
import * as AnswerController from "../../controllers/user/answer-controller"

const router = express.Router()

router.get("/active", AnswerController.active)

export default router
