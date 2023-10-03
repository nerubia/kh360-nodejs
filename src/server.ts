import dotenv from "dotenv"
import app from "./app"

dotenv.config()

const PORT = process.env.PORT ?? 5000

app.listen(5000, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`)
})
