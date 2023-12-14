import express from "express"
import * as ProjectMemberController from "../../controllers/admin/project-member-controller"

const router = express.Router()

router.get("/", ProjectMemberController.index)
router.get("/search", ProjectMemberController.search)

export default router
