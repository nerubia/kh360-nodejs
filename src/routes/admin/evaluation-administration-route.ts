import express from "express"
import * as EvaluationAdministrationController from "../../controllers/admin/evaluation-administration-controller"

const router = express.Router()

router.get("/", EvaluationAdministrationController.index)
router.post("/", EvaluationAdministrationController.store)
router.get("/:id", EvaluationAdministrationController.show)
router.put("/:id", EvaluationAdministrationController.update)
router.delete("/:id", EvaluationAdministrationController.destroy)

router.get("/:id/generate-status", EvaluationAdministrationController.generateStatus)
router.post("/:id/generate", EvaluationAdministrationController.generate)
router.post(
  "/:evaluation_result_id/generate-update",
  EvaluationAdministrationController.generateUpdate
)
router.post("/:id/cancel", EvaluationAdministrationController.cancel)
router.post("/:id/close", EvaluationAdministrationController.close)
router.post("/:id/publish", EvaluationAdministrationController.publish)
router.post("/:id/reopen", EvaluationAdministrationController.reopen)

router.post("/:id/send-reminder", EvaluationAdministrationController.sendReminder)

router.get("/:id/evaluators", EvaluationAdministrationController.getEvaluators)
router.post("/:id/evaluators", EvaluationAdministrationController.addEvaluator)

router.post(
  "/:id/add-external-evaluators",
  EvaluationAdministrationController.addExternalEvaluators
)

export default router
