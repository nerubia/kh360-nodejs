import dotenv from "dotenv"
dotenv.config()

import app from "./app"

const PORT = process.env.PORT || 5000

app.listen(5000, () => console.log(`Server running on port ${PORT}`))
