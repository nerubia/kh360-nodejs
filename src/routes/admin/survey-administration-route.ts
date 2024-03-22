import express from "express"
import * as SurveyAdminsitrationController from "../../controllers/admin/survey-administration-controller"

const router = express.Router()

router.get("/", SurveyAdminsitrationController.index)
router.get("/:id", SurveyAdminsitrationController.show)
router.post("/", SurveyAdminsitrationController.store)
router.put("/:id", SurveyAdminsitrationController.update)
router.delete("/:id", SurveyAdminsitrationController.destroy)

router.post("/:id/close", SurveyAdminsitrationController.close)
router.post("/:id/cancel", SurveyAdminsitrationController.cancel)
router.post("/:id/reopen", SurveyAdminsitrationController.reopen)

export default router
