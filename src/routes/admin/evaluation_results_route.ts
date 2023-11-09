import express from "express"
import {
  all,
  destroy,
  index,
  setStatus,
  show,
  store,
} from "../../controllers/admin/evaluation_results_controller"

const router = express.Router()

router.get("/all", all) // TODO: Refactor

router.get("/", index)
router.post("/", store)
router.get("/:id", show)
router.delete("/:id", destroy)
router.patch("/:id/set-status", setStatus)

export default router
