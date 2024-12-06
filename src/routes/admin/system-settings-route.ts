import express from "express"
import * as SystemSettingsController from "../../controllers/admin/system-settings-controller"

const router = express.Router()

router.get("/:name", SystemSettingsController.getByName)

export default router
