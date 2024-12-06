import * as AnswerRepository from "../repositories/answer-repository"
import * as AnswerOptionRepository from "../repositories/answer-option-repository"
import * as SkillMapAdministrationRepository from "../repositories/skill-map-administration-repository"
import * as SkillMapResultRepository from "../repositories/skill-map-result-repository"
import * as SkillMapRatingRepository from "../repositories/skill-map-rating-repository"
import * as SkillRepository from "../repositories/skill-repository"
import * as UserRepository from "../repositories/user-repository"
import * as SystemSettingsRepository from "../repositories/system-settings-repository"
import { sendMail } from "../utils/sendgrid"
import {
  type SkillMapAdministration,
  SkillMapAdministrationStatus,
} from "../types/skill-map-administration-type"
import CustomError from "../utils/custom-error"
import { format } from "date-fns"
import { SkillMapRatingStatus } from "../types/skill-map-rating-type"
import { SkillMapResultStatus } from "../types/skill-map-result-type"
import { parseSkillMapData } from "../utils/skill-map-admin"
import { type UserToken } from "../types/user-token-type"
import { type Prisma } from "@prisma/client"
import { parse } from "csv-parse/sync"
import { removeWhitespace } from "../utils/format-string"
import { convertOldAnswer } from "../utils/answer"
import { EmailSender } from "../types/email-sender"

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
  const { name } = data
  if (name == null) {
    throw new CustomError("Name is required to create a SkillMapAdministration", 400)
  }
  const skillMapAdmin = await SkillMapAdministrationRepository.getByName(name)
  if (skillMapAdmin !== null) {
    throw new CustomError("Skill Map Admin name should be unique", 400)
  }
  return await SkillMapAdministrationRepository.create(data)
}

export const upload = async (user: UserToken, data: SkillMapAdministration, file: string) => {
  if (file === undefined) {
    throw new CustomError("Invalid file", 400)
  }

  const { name } = data

  if (name == null) {
    throw new CustomError("Name is required to create a SkillMapAdministration", 400)
  }
  const skillMapAdmin = await SkillMapAdministrationRepository.getByName(name.trim())
  if (skillMapAdmin !== null) {
    throw new CustomError("Skill Map Admin name should be unique", 400)
  }

  const newSkillMapAdmin = await SkillMapAdministrationRepository.create(data)

  const prefix = /^data:text\/csv;base64,/

  if (!prefix.test(file)) {
    throw new CustomError("Invalid file", 400)
  }

  const skillMapRatings: Prisma.skill_map_ratingsUncheckedCreateInput[] = []
  const currentDate = new Date()

  const skills = await SkillRepository.getAllSkills({})

  const answer = await AnswerRepository.getByFilters({ name: "Skill Map Scale" })

  if (answer === null) {
    throw new CustomError("Answer not found", 400)
  }

  const answerOptions = await AnswerOptionRepository.getAllByFilters({
    answer_id: answer.id,
  })

  const base64String = file.replace(prefix, "")
  const decodedFile = Buffer.from(base64String, "base64")
  const records = parse(decodedFile, { columns: true })

  const successList: string[] = []
  const errorList: string[] = []

  const latestSkillMapAdministrations = await SkillMapAdministrationRepository.getAllByFilters({
    skill_map_period_end_date: {
      gt: new Date(newSkillMapAdmin.skill_map_period_end_date ?? new Date()),
    },
    status: {
      in: [SkillMapAdministrationStatus.Ongoing, SkillMapAdministrationStatus.Closed],
    },
  })

  for (const record of records) {
    const submittedDate = record["Submitted Date"]
    const email = record["Email Address"]
    const otherSkillData = record["Other technologies not listed, please enumerate."] as string

    if (email === undefined || email === "") {
      continue
    }

    if (submittedDate === undefined || submittedDate === "") {
      if (!errorList.includes(email)) {
        errorList.push(email)
      }
      continue
    }

    const existingUser = await UserRepository.getByEmail(email)

    if (existingUser !== null) {
      const latestSubmittedSkillMapResults = await SkillMapResultRepository.getAllByFilters({
        skill_map_administration_id: {
          in: latestSkillMapAdministrations.map(
            (latestSkillMapAdministration) => latestSkillMapAdministration.id
          ),
        },
        user_id: existingUser.id,
        status: {
          in: [SkillMapResultStatus.Closed, SkillMapResultStatus.Submitted],
        },
      })

      const skillMapResult = await SkillMapResultRepository.create({
        skill_map_administration_id: newSkillMapAdmin.id,
        user_id: existingUser.id,
        submitted_date: new Date(submittedDate),
        comments: otherSkillData,
        status: SkillMapResultStatus.Closed,
        created_by_id: user.id,
      })

      const jsonDataArray = Object.keys(record)

      for (const key of jsonDataArray) {
        const answerOptionName = convertOldAnswer(record[key])

        const answerOption = answerOptions.find(
          (answerOption) => answerOption.name === answerOptionName
        )

        if (answerOption !== undefined) {
          const parsedSkills = parseSkillMapData(key, record[key])
          // NOTE: Valid format. Ex: Programming Language [Javascript]
          if (parsedSkills !== null) {
            const skill = skills.find((skill) => skill.name === parsedSkills.skill)
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

            if (skill !== undefined) {
              for (const latestSubmittedSkillMapResult of latestSubmittedSkillMapResults) {
                const existingSkillMapRating = latestSubmittedSkillMapResult.skill_map_ratings.find(
                  (latestSubmittedSkillMapResult) =>
                    latestSubmittedSkillMapResult.skill_id === skill.id
                )
                if (existingSkillMapRating === undefined) {
                  skillMapRatings.push({
                    skill_map_administration_id:
                      latestSubmittedSkillMapResult.skill_map_administration_id,
                    skill_map_result_id: latestSubmittedSkillMapResult.id,
                    user_id: existingUser.id,
                    skill_id: skill.id,
                    skill_category_id: skill.skill_category_id,
                    answer_option_id: answerOption.id,
                    status: SkillMapRatingStatus.Submitted,
                    created_at: currentDate,
                    updated_at: currentDate,
                  })
                }
              }
            }
          } else {
            // NOTE: Invalid format. Ex: Custom Skill
            skillMapRatings.push({
              skill_map_administration_id: newSkillMapAdmin.id,
              skill_map_result_id: skillMapResult.id,
              user_id: existingUser.id,
              skill_id: null,
              skill_category_id: null,
              other_skill_name: key,
              answer_option_id: answerOption.id,
              status: SkillMapRatingStatus.Submitted,
              created_at: currentDate,
              updated_at: currentDate,
            })
          }
        }
      }
      if (!successList.includes(email)) {
        successList.push(email)
      }
    } else {
      if (!errorList.includes(email)) {
        errorList.push(email)
      }
    }
  }

  await SkillMapRatingRepository.createMany(skillMapRatings)

  return {
    data: newSkillMapAdmin,
    successList,
    errorList,
  }
}

export const updateById = async (id: number, data: SkillMapAdministration) => {
  const skillMapAdministration = await SkillMapAdministrationRepository.getById(id)
  if (skillMapAdministration === null) {
    throw new CustomError("Invalid Id.", 400)
  }
  const existingSkillMapAdmin = await SkillMapAdministrationRepository.getByName(
    removeWhitespace(data.name as string)
  )
  if (existingSkillMapAdmin !== null) {
    if (skillMapAdministration.id !== existingSkillMapAdmin.id) {
      throw new CustomError("Skill Map Admin name should be unique", 400)
    }
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

  const removeSpace = {
    ...data,
    name: removeWhitespace(data.name as string),
  }

  return await SkillMapAdministrationRepository.updateById(id, removeSpace)
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

    const systemSettings = await SystemSettingsRepository.getByName(EmailSender.SKILL_MAP)

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
        await sendMail({
          to: [respondent.email],
          from: systemSettings?.value,
          subject: skillMapAdministration.email_subject ?? "",
          content: modifiedContent,
        })
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

  if (skillMapAdministration !== null) {
    if (skillMapAdministration?.is_uploaded !== null) {
      await SkillMapAdministrationRepository.updateStatusById(
        skillMapAdministration.id,
        SkillMapAdministrationStatus.Ongoing
      )
    }
  }

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
