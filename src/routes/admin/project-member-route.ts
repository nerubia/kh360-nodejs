import express from "express"
import * as ProjectMemberController from "../../controllers/admin/project-member-controller"

const router = express.Router()

router.get("/", ProjectMemberController.index)

export default router
