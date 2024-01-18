import express from "express"
import {
  destroy,
  getDefaultEmailTemplate,
  index,
  show,
  store,
  update,
  listTemplateType,
} from "../../controllers/admin/email-template-controller"

const router = express.Router()

router.get("/default", getDefaultEmailTemplate)
router.get("/types", listTemplateType)
router.get("/", index)
router.get("/:id", show)
router.post("/", store)
router.put("/:id", update)
router.delete("/:id", destroy)

export default router
