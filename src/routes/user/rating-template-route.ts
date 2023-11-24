import express from "express"
import { getRatingTemplates } from "../../controllers/user/rating-template-controller"

const router = express.Router()

router.get("/", getRatingTemplates)

export default router
