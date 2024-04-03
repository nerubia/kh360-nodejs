import express from "express"
import * as EmailTemplateController from "../../controllers/user/email-template-controller"
import * as ScoreRatingController from "../../controllers/user/score-rating-controller"
import * as UserController from "../../controllers/user/user-controller"
import * as LogoutController from "../../controllers/user/logout-controller"
import * as EvaluationResultController from "../../controllers/admin/evaluation-result-controller"

const router = express.Router()

router.get("/email-templates", EmailTemplateController.index)

router.get("/evaluations", UserController.getEvaluations)
router.get("/evaluation-administrations", UserController.getEvaluationAdministrations)
router.post("/evaluations/:id/submit-answer", UserController.submitAnswer)
router.post("/evaluations/:id/submit-comment", UserController.submitComment)
router.post("/evaluations/:id/submit-evaluation", UserController.submitEvaluation)
router.post("/evaluations/:id/request-remove", UserController.sendRequestToRemove)

router.get("/my-evaluations", UserController.getEvaluationAdministrationsAsEvaluee)
router.get("/my-evaluations/:id", UserController.getUserEvaluationResult)
router.get("/score-ratings", ScoreRatingController.index)

router.get("/evaluation-results/:id/evaluators", EvaluationResultController.getEvaluators)
router.get("/evaluation-results", EvaluationResultController.index)
router.get("/evaluation-results/:id", EvaluationResultController.show)

router.get("/survey-administrations", UserController.getSurveyAdministrations)
router.post("/external-users", UserController.storeExternalUser)
router.post("/survey-results", UserController.createSurveyResult)
router.get("/survey-questions/", UserController.getSurveyQuestions)
router.get("/survey-questions/companions/:survey_result_id", UserController.getCompanionQuestions)
router.post("/survey-administrations/:id/submit-survey", UserController.submitSurveyAnswers)

// TODO: Refactor
router.get("/profile", UserController.getProfile)
router.get("/mail", UserController.sendSampleMail)
router.post("/logout", LogoutController.logout)

export default router
