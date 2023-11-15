import express from "express"
import * as ExternalUserController from "../../controllers/admin/external-user-controller"

const router = express.Router()

router.get("/", ExternalUserController.index)
router.post("/", ExternalUserController.store)
router.get("/:id", ExternalUserController.show)
router.put("/:id", ExternalUserController.update)
router.delete("/:id", ExternalUserController.destroy)

export default router
