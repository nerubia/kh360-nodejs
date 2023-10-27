import express from "express"
import {
  store,
  show,
  index,
  update,
  generate,
  generateStatus,
} from "../../controllers/admin/evaluation_administrations_controller"

const router = express.Router()

router.get("/", index)
router.post("/", store)
router.get("/:id", show)
router.put("/:id", update)
router.get("/:id/generate-status", generateStatus)
router.post("/:id/generate", generate)

export default router
