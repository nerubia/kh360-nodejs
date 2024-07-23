import express from "express"
import * as JsonSchema from "../../controllers/admin/json-schema-controller"

const router = express.Router()

router.get("/", JsonSchema.index)

export default router
