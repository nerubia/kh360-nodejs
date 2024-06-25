import * as AnswerOptionRepository from "../repositories/answer-option-repository"
import * as SkillMapAdministrationRepository from "../repositories/skill-map-administration-repository"
import * as SkillMapResultRepository from "../repositories/skill-map-result-repository"
import * as SkillMapRatingRepository from "../repositories/skill-map-rating-repository"
import * as SkillRepository from "../repositories/skill-repository"
import * as UserRepository from "../repositories/user-repository"
import { sendMail } from "../utils/sendgrid"
import {
  type SkillMapAdministration,
  SkillMapAdministrationStatus,
} from "../types/skill-map-administration-type"
import CustomError from "../utils/custom-error"
import { format } from "date-fns"
import { SkillMapRatingStatus } from "../types/skill-map-rating-type"
import { SkillMapResultStatus } from "../types/skill-map-result-type"
import XLSX from "xlsx"
import { parseSkillMapData } from "../utils/skill-map-admin"
import { type UserToken } from "../types/user-token-type"
import { type Prisma } from "@prisma/client"

export const getAllByFilters = async (name: string, status: string, page: string) => {
  const itemsPerPage = 10
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where = {
    name: {
      contains: name,
    },
  }

  if (status !== undefined && status !== "all") {
    const statuses = status.split(",")
    Object.assign(where, {
      status: {
        in: statuses,
      },
    })
  }
  const skillMapAdministrations = await SkillMapAdministrationRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const totalItems = await SkillMapAdministrationRepository.countAllByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    data: skillMapAdministrations,
    pageInfo: {
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      currentPage,
      totalPages,
      totalItems,
    },
  }
}

export const getAllByStatus = async (status: string) => {
  return await SkillMapAdministrationRepository.getAllByFilters({ status })
}

export const getAllByStatusAndDate = async (status: string, date: Date) => {
  return await SkillMapAdministrationRepository.getAllByStatusAndDate(status, date)
}

export const getAllByStatusAndEndDate = async (status: string, date: Date) => {
  return await SkillMapAdministrationRepository.getAllByStatusAndEndDate(status, date)
}

export const create = async (data: SkillMapAdministration) => {
  return await SkillMapAdministrationRepository.create(data)
}

export const upload = async (user: UserToken, data: SkillMapAdministration, file: string) => {
  if (file === undefined) {
    throw new CustomError("Invalid file", 400)
  }

  const newSkillMapAdmin = await SkillMapAdministrationRepository.create(data)

  const prefix = /^data:application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,/

  if (!prefix.test(file)) {
    throw new CustomError("Invalid file", 400)
  }

  const base64String = file.replace(prefix, "")
  const decodedFile = Buffer.from(base64String, "base64")

  const workbook = XLSX.read(decodedFile)
  const targetSheetName = "Sample CSV Data for Skill Map A"
  const sheet_name_list = workbook.SheetNames

  const skills = await SkillRepository.getAllSkills({})
  const answerOptions = await AnswerOptionRepository.getAllByFilters({})

  const skillMapRatings: Prisma.skill_map_ratingsUncheckedCreateInput[] = []
  const currentDate = new Date()

  for (const sheetName of sheet_name_list) {
    if (sheetName === targetSheetName) {
      const worksheet = workbook.Sheets[sheetName]
      const worksheetJson: never[] = XLSX.utils.sheet_to_json(worksheet, { raw: true })

      for (const jsonData of worksheetJson) {
        const submittedDate = jsonData["Submitted Date"]
        const email = jsonData["Email Address"]

        const existingUser = await UserRepository.getByEmail(email)

        if (existingUser !== null) {
          const skillMapResult = await SkillMapResultRepository.create({
            skill_map_administration_id: newSkillMapAdmin.id,
            user_id: existingUser.id,
            submitted_date: new Date(submittedDate),
            status: SkillMapResultStatus.Closed,
            created_by_id: user.id,
          })

          const jsonDataArray = Object.keys(jsonData)

          for (const key of jsonDataArray) {
            const parsedSkills = parseSkillMapData(key, jsonData[key])
            if (parsedSkills !== null) {
              const skill = skills.find((skill) => skill.name === parsedSkills.skill)
              const answerOption = answerOptions.find(
                (answerOption) => answerOption.name === parsedSkills.rating
              )
              if (answerOption !== undefined) {
                skillMapRatings.push({
                  skill_map_administration_id: newSkillMapAdmin.id,
                  skill_map_result_id: skillMapResult.id,
                  user_id: existingUser.id,
                  skill_id: skill !== undefined ? skill.id : null,
                  skill_category_id: skill !== undefined ? skill.skill_category_id : null,
                  other_skill_name: skill === undefined ? parsedSkills.skill : null,
                  answer_option_id: answerOption.id,
                  status: SkillMapRatingStatus.Submitted,
                  created_at: currentDate,
                  updated_at: currentDate,
                })
              }
            }
          }

          const otherSkillData = jsonData[
            "Other technologies not listed, please enumerate."
          ] as string
          const otherSkills = otherSkillData.split(",")

          for (const otherSkill of otherSkills) {
            skillMapRatings.push({
              skill_map_administration_id: newSkillMapAdmin.id,
              skill_map_result_id: skillMapResult.id,
              user_id: user.id,
              other_skill_name: otherSkill,
              status: SkillMapRatingStatus.Submitted,
              created_at: currentDate,
              updated_at: currentDate,
            })
          }
        }
      }
    }
  }

  await SkillMapRatingRepository.createMany(skillMapRatings)

  return newSkillMapAdmin
}

export const updateById = async (id: number, data: SkillMapAdministration) => {
  const skillMapAdministration = await SkillMapAdministrationRepository.getById(id)
  if (skillMapAdministration === null) {
    throw new CustomError("Invalid Id.", 400)
  }

  if (
    skillMapAdministration.status !== SkillMapAdministrationStatus.Draft &&
    skillMapAdministration.status !== SkillMapAdministrationStatus.Pending
  ) {
    throw new CustomError("Only Draft and Pending status is allowed.", 403)
  }

  const currentDate = new Date()

  if (
    data.skill_map_schedule_start_date != null &&
    data.skill_map_schedule_start_date <= currentDate &&
    data.status === SkillMapAdministrationStatus.Pending
  ) {
    await SkillMapAdministrationRepository.updateStatusById(
      id,
      SkillMapAdministrationStatus.Processing
    )
  }

  return await SkillMapAdministrationRepository.updateById(id, data)
}

export const getById = async (id: number) => {
  return await SkillMapAdministrationRepository.getById(id)
}

export const deleteById = async (id: number) => {
  const skillMapAdministration = await SkillMapAdministrationRepository.getById(id)
  if (skillMapAdministration === null) {
    throw new CustomError("Skill Map administration not found", 400)
  }
  if (skillMapAdministration.status !== SkillMapAdministrationStatus.Draft) {
    throw new CustomError("This action is not allowed", 400)
  }
  return await SkillMapAdministrationRepository.deleteById(id)
}

export const updateStatusById = async (id: number, status: string) => {
  await SkillMapAdministrationRepository.updateStatusById(id, status)
}

export const sendSkillMapEmailById = async (id: number) => {
  const skillMapAdministration = await SkillMapAdministrationRepository.getById(id)

  if (skillMapAdministration !== null) {
    const skilMapResults = await SkillMapResultRepository.getAllByFilters({
      skill_map_administration_id: skillMapAdministration.id,
    })

    for (const skillMapResult of skilMapResults) {
      const emailContent = skillMapAdministration.email_content ?? ""

      const scheduleEndDate = format(
        skillMapAdministration.skill_map_schedule_end_date ?? new Date(),
        "EEEE, MMMM d, yyyy"
      )

      const replacements: Record<string, string> = {
        skill_map_admin_name: skillMapAdministration.name ?? "",
        skill_map_end_date: scheduleEndDate,
      }

      let modifiedContent: string = emailContent.replace(
        /{{(.*?)}}/g,
        (match: string, p1: string) => {
          return replacements[p1] ?? match
        }
      )
      modifiedContent = modifiedContent.replace(/(?:\r\n|\r|\n)/g, "<br>")
      const respondent = await UserRepository.getById(skillMapResult.user_id ?? 0)
      modifiedContent = modifiedContent.replace(
        "{{link}}",
        `<a href='${process.env.APP_URL}/skill-map-forms/${skillMapAdministration.id}'>link</a>`
      )
      if (respondent !== null) {
        modifiedContent = modifiedContent.replace(
          "{{respondent_first_name}}",
          `${respondent.first_name}`
        )
        await sendMail(
          respondent.email,
          skillMapAdministration.email_subject ?? "",
          modifiedContent
        )
      }
    }
  }
}

export const close = async (id: number) => {
  const skillMapAdministration = await SkillMapAdministrationRepository.getById(id)

  if (skillMapAdministration === null) {
    throw new CustomError("Id not found", 400)
  }

  if (skillMapAdministration.status !== SkillMapAdministrationStatus.Ongoing) {
    throw new CustomError("Only ongoing status is allowed.", 403)
  }

  await SkillMapAdministrationRepository.updateStatusById(
    skillMapAdministration.id,
    SkillMapAdministrationStatus.Closed
  )

  const skilMapResults = await SkillMapResultRepository.getAllByFilters({
    skill_map_administration_id: skillMapAdministration.id,
    skill_map_ratings: {
      some: {},
    },
  })

  const noAnswerSkillMapResults = await SkillMapResultRepository.getAllByFilters({
    skill_map_administration_id: skillMapAdministration.id,
    status: { in: [SkillMapResultStatus.Ongoing, SkillMapResultStatus.Open] },
    skill_map_ratings: {
      none: {},
    },
  })

  for (const skillMapResult of skilMapResults) {
    await SkillMapResultRepository.updateById(skillMapResult.id, {
      status: SkillMapResultStatus.Closed,
    })
  }

  for (const noAnswerSkillMapResult of noAnswerSkillMapResults) {
    await SkillMapResultRepository.updateById(noAnswerSkillMapResult.id, {
      status: SkillMapResultStatus.NoResult,
    })
  }

  const skillMapRatings = await SkillMapRatingRepository.getAllByFilters({
    skill_map_administration_id: skillMapAdministration.id,
    status: {
      in: [SkillMapRatingStatus.Pending, SkillMapRatingStatus.Open, SkillMapRatingStatus.Ongoing],
    },
  })

  for (const skillMapRating of skillMapRatings) {
    await SkillMapRatingRepository.updateById(skillMapRating.id, {
      status: SkillMapRatingStatus.Expired,
    })
  }
}

export const cancel = async (id: number) => {
  const skillMapAdministration = await SkillMapAdministrationRepository.getById(id)

  if (skillMapAdministration === null) {
    throw new CustomError("Id not found", 400)
  }

  if (
    skillMapAdministration.status !== SkillMapAdministrationStatus.Pending &&
    skillMapAdministration.status !== SkillMapAdministrationStatus.Ongoing
  ) {
    throw new CustomError("Only ongoing or pending status is allowed.", 403)
  }

  await SkillMapAdministrationRepository.updateStatusById(
    skillMapAdministration.id,
    SkillMapAdministrationStatus.Cancelled
  )

  const skillMapResults = await SkillMapResultRepository.getAllByFilters({
    skill_map_administration_id: skillMapAdministration.id,
  })

  for (const skillMapResult of skillMapResults) {
    await SkillMapResultRepository.updateById(skillMapResult.id, {
      status: SkillMapResultStatus.Cancelled,
    })
  }

  const skillMapRatings = await SkillMapRatingRepository.getAllByFilters({
    skill_map_administration_id: skillMapAdministration.id,
    status: {
      in: [SkillMapRatingStatus.Pending, SkillMapRatingStatus.Open, SkillMapRatingStatus.Ongoing],
    },
  })

  for (const skillMapRating of skillMapRatings) {
    await SkillMapRatingRepository.updateById(skillMapRating.id, {
      status: SkillMapRatingStatus.Cancelled,
    })
  }
}

export const reopen = async (id: number) => {
  const skillMapAdministration = await SkillMapAdministrationRepository.getById(id)

  if (skillMapAdministration === null) {
    throw new CustomError("Id not found", 400)
  }

  if (skillMapAdministration.status !== SkillMapAdministrationStatus.Closed) {
    throw new CustomError("Only closed status is allowed.", 403)
  }

  await SkillMapAdministrationRepository.updateStatusById(
    skillMapAdministration.id,
    SkillMapAdministrationStatus.Ongoing
  )

  const skillMapResults = await SkillMapResultRepository.getAllByFilters({
    skill_map_administration_id: skillMapAdministration.id,
    status: SkillMapResultStatus.Closed,
  })

  for (const skillMapResult of skillMapResults) {
    await SkillMapResultRepository.updateById(skillMapResult.id, {
      status: SkillMapResultStatus.Submitted,
    })
  }

  const noResultSkillMapResults = await SkillMapResultRepository.getAllByFilters({
    skill_map_administration_id: skillMapAdministration.id,
    status: SkillMapResultStatus.NoResult,
  })

  for (const skillMapResult of noResultSkillMapResults) {
    await SkillMapResultRepository.updateById(skillMapResult.id, {
      status: SkillMapResultStatus.Ongoing,
    })
  }

  const skillMapRatings = await SkillMapRatingRepository.getAllByFilters({
    skill_map_administration_id: skillMapAdministration.id,
    status: SkillMapRatingStatus.Expired,
  })

  for (const skillMapRating of skillMapRatings) {
    await SkillMapRatingRepository.updateById(skillMapRating.id, {
      status: SkillMapRatingStatus.Open,
    })
  }
}
