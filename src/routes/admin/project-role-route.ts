import express from "express"
import * as ProjectRoleController from "../../controllers/admin/project-role-controller"

const router = express.Router()

router.get("/", ProjectRoleController.index)

export default router
