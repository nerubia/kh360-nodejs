import "dotenv/config"
import app from "./app"
import "./utils/scheduler"
import logger from "./utils/logger"

const PORT = process.env.PORT ?? 5000

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})
