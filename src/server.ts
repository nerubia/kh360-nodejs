import "dotenv/config"
// import app from "./app"
import "./utils/scheduler"
// import logger from "./utils/logger"
// import webSocketServer from "./utils/web-socket"

// const PORT = process.env.PORT ?? 5000

/**
 * WebSocket
 */
// const server = webSocketServer(app)
//
// server.listen(PORT, () => {
//   logger.info(`Server running on port ${PORT}`)
// })
//

import XLSX from "xlsx"
import path from "path"

const parseSkillData = (skillData: string, rating: string) => {
  if (skillData.includes("]")) {
    const regex = /^(.*?)\s*\[(.*?)\]\s*$/
    const match = skillData.match(regex)

    if (match !== null) {
      return {
        category: match[1],
        skill: match[2],
        rating,
      }
    }
  }

  return null
}

const dirPath = path.join(__dirname, "sample.xlsx")
const workbook = XLSX.readFile(dirPath, { cellDates: true })

const targetSheetName = "Sample CSV Data for Skill Map A"
const sheet_name_list = workbook.SheetNames

sheet_name_list.forEach(function (sheetName) {
  if (sheetName === targetSheetName) {
    const worksheet = workbook.Sheets[sheetName]
    const worksheetJson: never[] = XLSX.utils.sheet_to_json(worksheet, { raw: true })

    for (const jsonData of worksheetJson) {
      const submittedDate = jsonData["Submitted Date"]
      const email = jsonData["Email Address"]
      const skills = Object.keys(jsonData).map((key) => {
        return parseSkillData(key, jsonData[key])
      })
      const otherSkills = jsonData["Other technologies not listed, please enumerate."]

      // eslint-disable-next-line no-console
      console.log({
        submittedDate,
        email,
        skills,
        otherSkills,
      })
    }
  }
})
