import "dotenv/config"
import app from "./app"
import "./utils/scheduler"

const PORT = process.env.PORT ?? 5000

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`)
})
