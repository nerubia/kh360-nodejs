import express from "express"
import * as UserController from "../../controllers/user/user-controller"
import * as LogoutController from "../../controllers/user/logout_controller"

const router = express.Router()

router.get("/evaluations", UserController.getEvaluations)
router.get("/evaluation-administrations", UserController.getEvaluationAdministrations)
router.post("/evaluations/:id/submit-answer", UserController.submitAnswer)
router.post("/evaluations/:id/submit-comment", UserController.submitComment)
router.post("/evaluations/:id/submit-evaluation", UserController.submitEvaluation)
router.post("/evaluations/:id/submit-evaluation", UserController.submitEvaluation)

// TODO: Refactor
router.get("/profile", UserController.getProfile)
router.get("/mail", UserController.sendSampleMail)
router.post("/logout", LogoutController.logout)

export default router
