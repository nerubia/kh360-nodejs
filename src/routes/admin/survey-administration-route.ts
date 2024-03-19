import express from "express"
import {
  index,
  show,
  store,
  update,
  destroy,
} from "../../controllers/admin/survey-administration-controller"

const router = express.Router()

router.get("/", index)
router.get("/:id", show)
router.post("/", store)
router.put("/:id", update)
router.delete("/:id", destroy)

export default router
