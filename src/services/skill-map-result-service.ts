import { SkillMapResultStatus } from "../types/skill-map-result-type"
import * as SkillMapResultRepository from "../repositories/skill-map-result-repository"
import * as SkillMapAdministrationRepository from "../repositories/skill-map-administration-repository"
import * as SkillMapRatingRepository from "../repositories/skill-map-rating-repository"
import * as EmailTemplateRepository from "../repositories/email-template-repository"
import * as EmailLogRepository from "../repositories/email-log-repository"
import * as UserRepository from "../repositories/user-repository"
import CustomError from "../utils/custom-error"
import { type UserToken } from "../types/user-token-type"
import { SkillMapAdministrationStatus } from "../types/skill-map-administration-type"
import { sendMail } from "../utils/sendgrid"
import { format } from "date-fns"
import { EmailLogType, type EmailLog } from "../types/email-log-type"
import * as SkillRepository from "../repositories/skill-repository"
export const create = async (
  skill_map_administration_id: number,
  employee_ids: number[],
  user: UserToken
) => {
  const employeeIds = employee_ids

  if (employeeIds.length === 0) {
    throw new CustomError("Must have at least 1 employee selected.", 400)
  }

  const skillMapAdministration = await SkillMapAdministrationRepository.getById(
    skill_map_administration_id
  )

  if (skillMapAdministration === null) {
    throw new CustomError("Invalid id.", 400)
  }

  if (skillMapAdministration.skill_map_schedule_end_date !== null) {
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    const skill_map_end_date = new Date(skillMapAdministration.skill_map_schedule_end_date)
    skill_map_end_date.setHours(0, 0, 0, 0)

    if (skill_map_end_date < currentDate) {
      throw new CustomError("Unable to proceed. Skill Map schedule has lapsed.", 400)
    }
  }

  const skillMapResults = await SkillMapResultRepository.getAllByFilters({
    skill_map_administration_id: skillMapAdministration.id,
  })

  let newEmployeeIds = []

  newEmployeeIds = employeeIds.filter((employeeId) => {
    const skillMapResult = skillMapResults.find(
      (skillMapResult) => skillMapResult.user_id === employeeId
    )
    return skillMapResult === undefined ? employeeId : null
  })

  const currentDate = new Date()

  const data = newEmployeeIds.map((employeeId) => {
    return {
      skill_map_administration_id: skillMapAdministration.id,
      user_id: employeeId,
      submitted_date: currentDate,
      status:
        skillMapAdministration.status === SkillMapAdministrationStatus.Ongoing
          ? SkillMapResultStatus.Ongoing
          : SkillMapResultStatus.Open,
      created_by_id: user.id,
      updated_by_id: user.id,
      created_at: currentDate,
      updated_at: currentDate,
    }
  })

  await SkillMapResultRepository.createMany(data)

  const newSkillMapResults = await SkillMapResultRepository.getAllByFilters({
    skill_map_administration_id: skillMapAdministration.id,
    user_id: {
      in: newEmployeeIds,
    },
  })

  for (const skillMapResult of newSkillMapResults) {
    const userId = skillMapResult.users?.id

    if (userId !== undefined) {
      if (skillMapAdministration.status === SkillMapAdministrationStatus.Ongoing) {
        await sendSkillMapEmailByRespondentId(userId, skillMapAdministration.id)
      }
    }
  }

  if (skillMapAdministration.status === SkillMapAdministrationStatus.Draft) {
    await SkillMapAdministrationRepository.updateStatusById(
      skillMapAdministration.id,
      skillMapAdministration.skill_map_schedule_start_date != null &&
        skillMapAdministration.skill_map_schedule_start_date > currentDate
        ? SkillMapAdministrationStatus.Pending
        : SkillMapAdministrationStatus.Processing
    )
  }

  const result = { skill_map_administration_id: skillMapAdministration.id }

  return result
}

export const deleteById = async (id: number) => {
  const skillMapResult = await SkillMapResultRepository.getById(id)

  const deletedIds = []

  if (skillMapResult === null) {
    throw new CustomError("Skill Map Result not found", 400)
  }

  const skillMapRatings = await SkillMapRatingRepository.getAllByFilters({
    skill_map_result_id: skillMapResult.id,
  })

  const skillMapRatingIds = skillMapRatings.map((rating) => rating.id)

  await SkillMapRatingRepository.deleteManyByIds(skillMapRatingIds)

  await SkillMapResultRepository.deleteById(skillMapResult.id)

  deletedIds.push(skillMapResult.id)

  return deletedIds
}

export const getAllBySkillMapAdminId = async (skill_map_administration_id: number) => {
  const skillMapAdministration = await SkillMapAdministrationRepository.getById(
    skill_map_administration_id
  )

  if (skillMapAdministration === null) {
    throw new CustomError("Invalid skill_map admin id.", 400)
  }

  const skillMapResults = await SkillMapResultRepository.getAllByFilters({
    skill_map_administration_id: skillMapAdministration.id,
    deleted_at: null,
  })

  const finalSkillMapResults = await Promise.all(
    skillMapResults.map(async (skillMapResult) => {
      const email_logs = await EmailLogRepository.getAllByFilters({
        email_address: skillMapResult.users?.email,
        email_type: "Skill Map Reminder",
        notes: {
          contains: `"skill_map_administration_id": ${skillMapAdministration.id}`,
        },
      })

      return {
        ...skillMapResult,
        email_logs,
      }
    })
  )
  return finalSkillMapResults
}

export const updateStatusByAdministrationId = async (
  skill_map_administration_id: number,
  status: string
) => {
  await SkillMapResultRepository.updateStatusByAdministrationId(skill_map_administration_id, status)
}

export const sendReminderByRespondent = async (
  skill_map_administration_id: number,
  user_id: number
) => {
  const skillMapAdministration = await SkillMapAdministrationRepository.getById(
    skill_map_administration_id
  )

  if (skillMapAdministration === null) {
    throw new CustomError("Skill Map administration not found", 400)
  }

  const emailTemplate = await EmailTemplateRepository.getByTemplateType("Skill Map Reminder")

  if (emailTemplate === null) {
    throw new CustomError("Default email template not found", 400)
  }

  const respondent = await UserRepository.getById(user_id)

  if (respondent === null) {
    throw new CustomError("Respondent not found", 400)
  }

  const emailContent = emailTemplate.content ?? ""
  const scheduleEndDate = format(
    skillMapAdministration.skill_map_schedule_end_date ?? new Date(),
    "EEEE, MMMM d, yyyy"
  )

  const replacements: Record<string, string> = {
    skill_map_admin_name: skillMapAdministration.name ?? "",
    skill_map_end_date: scheduleEndDate,
  }

  let modifiedContent: string = emailContent.replace(/{{(.*?)}}/g, (match: string, p1: string) => {
    return replacements[p1] ?? match
  })
  modifiedContent = modifiedContent.replace(/(?:\r\n|\r|\n)/g, "<br>")
  modifiedContent = modifiedContent.replace(
    "{{link}}",
    `<a href='${process.env.APP_URL}/skill-map-forms/${skillMapAdministration.id}'>link</a>`
  )
  modifiedContent = modifiedContent.replace("{{respondent_first_name}}", `${respondent.first_name}`)

  const currentDate = new Date()

  const emailLogData: EmailLog = {
    content: modifiedContent,
    created_at: currentDate,
    email_address: respondent.email,
    email_status: EmailLogType.Pending,
    email_type: emailTemplate.template_type,
    mail_id: "",
    notes: `{"skill_map_administration_id": ${skillMapAdministration.id}}`,
    sent_at: currentDate,
    subject: emailTemplate.subject,
    updated_at: currentDate,
    user_id: respondent.id,
  }

  if (respondent !== null) {
    const sgResp = await sendMail(respondent.email, emailTemplate.subject ?? "", modifiedContent)
    if (sgResp !== null && sgResp !== undefined) {
      const mailId = sgResp[0].headers["x-message-id"]
      emailLogData.mail_id = mailId
      emailLogData.email_status = EmailLogType.Sent
    } else {
      emailLogData.email_status = EmailLogType.Error
    }

    await EmailLogRepository.create(emailLogData)

    return emailLogData
  }
}

export const sendSkillMapEmailByRespondentId = async (
  user_id: number,
  skill_map_administration_id: number
) => {
  const skillMapAdministration = await SkillMapAdministrationRepository.getById(
    skill_map_administration_id
  )

  if (skillMapAdministration !== null) {
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
    const respondent = await UserRepository.getById(user_id ?? 0)
    modifiedContent = modifiedContent.replace(
      "{{link}}",
      `<a href='${process.env.APP_URL}/skill-map-forms/${skillMapAdministration.id}'>link</a>`
    )
    if (respondent !== null) {
      modifiedContent = modifiedContent.replace(
        "{{respondent_first_name}}",
        `${respondent.first_name}`
      )
      await sendMail(respondent.email, skillMapAdministration.email_subject ?? "", modifiedContent)
    }
  }
}

export const reopen = async (id: number) => {
  const skillMapResult = await SkillMapResultRepository.getById(id)

  if (skillMapResult === null) {
    throw new CustomError("Id not found", 400)
  }

  if (skillMapResult.status !== SkillMapResultStatus.Submitted) {
    throw new CustomError("Only submitted status is allowed.", 403)
  }

  await SkillMapResultRepository.updateStatusById(skillMapResult.id, SkillMapResultStatus.Ongoing)
}
export const getAllByFilters = async (
  user: UserToken,
  skill_map_administration_id: string,
  skill: string,
  status: string,
  name: string,
  page: string
) => {
  if (
    !user.roles.includes("kh360") &&
    !user.roles.includes("khv2_cm_admin") &&
    !user.roles.includes("khv2_cm")
  ) {
    throw new CustomError("You do not have permission to view this.", 400)
  }
  const skillMapResultStatus = status === "all" ? "" : status

  const itemsPerPage = 10
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where = {
    status: {
      contains: skillMapResultStatus,
    },
  }

  if (skill_map_administration_id !== undefined || skill_map_administration_id === "all") {
    Object.assign(where, {
      skill_map_administration_id: {
        equals: parseInt(skill_map_administration_id),
      },
    })
  }
  if (name !== undefined) {
    Object.assign(where, {
      users: {
        OR: [
          {
            first_name: {
              contains: name,
            },
          },
          {
            last_name: {
              contains: name,
            },
          },
        ],
      },
    })
  }
  let skills
  if (skill !== undefined) {
    skills = await SkillRepository.getByName(skill)
  }

  const skillMapResults = await SkillMapResultRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const totalItems = await SkillMapResultRepository.countAllByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    data: {
      skillMapResults,
      skills,
    },
    pageInfo: {
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      currentPage,
      totalPages,
      totalItems,
    },
  }
}
