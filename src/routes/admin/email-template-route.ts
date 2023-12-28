import express from "express"
import {
  destroy,
  getDefaultEmailTemplate,
  index,
  store,
  update,
} from "../../controllers/admin/email-template-controller"

const router = express.Router()

router.get("/default", getDefaultEmailTemplate)
router.get("/", index)
router.post("/", store)
router.put("/:id", update)
router.delete("/:id", destroy)

export default router
