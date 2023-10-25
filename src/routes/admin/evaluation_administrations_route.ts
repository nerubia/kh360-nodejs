import express from "express"
import {
  store,
  show,
  index,
  update,
  createEvaluees,
} from "../../controllers/admin/evaluation_administrations_controller"

const router = express.Router()

router.get("/", index)
router.post("/", store)
router.get("/:id", show)
router.put("/:id", update)

// TODO: Move
router.post("/:id/evaluees", createEvaluees)

export default router
