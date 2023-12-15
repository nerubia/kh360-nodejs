import express from "express"
import * as ProjectMemberController from "../../controllers/admin/project-member-controller"

const router = express.Router()

router.get("/search", ProjectMemberController.search)

router.get("/", ProjectMemberController.index)
router.post("/", ProjectMemberController.store)
router.get("/:id", ProjectMemberController.show)
router.patch("/:id", ProjectMemberController.update)
router.delete("/:id", ProjectMemberController.destroy)

export default router
