import express from "express"
import bodyParser from "body-parser"
import { handleSendGrid } from "../controllers/webhook-controller"

const router = express.Router()

router.post("/sendgrid", bodyParser.raw({ type: "application/json" }), handleSendGrid)

export default router
