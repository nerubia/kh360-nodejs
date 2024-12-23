import * as AttendanceRepository from "../repositories/attendance-repository"
import * as EvaluationAdministrationRepository from "../repositories/evaluation-administration-repository"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import * as EvaluationResultRepository from "../repositories/evaluation-result-repository"
import * as EvaluationResultDetailRepository from "../repositories/evaluation-result-detail-repository"
import * as EvaluationTemplateRepository from "../repositories/evaluation-template-repository"
import * as EvaluationRatingRepository from "../repositories/evaluation-rating-repository"
import * as HolidayRepository from "../repositories/holiday-repository"
import * as LeaveBreakdownRepository from "../repositories/leave-breakdown-repository"
import * as LeaveRepository from "../repositories/leave-repository"
import * as ScoreRatingRepository from "../repositories/score-rating-repository"
import * as UserRepository from "../repositories/user-repository"
import * as ExternalUserRepository from "../repositories/external-user-repository"
import * as EvaluationTemplateContentRepository from "../repositories/evaluation-template-content-repository"
import * as ProjectRepository from "../repositories/project-repository"
import * as ProjectRoleRepository from "../repositories/project-role-repository"
import { EvaluationResultStatus, type EvaluationResult } from "../types/evaluation-result-type"
import * as AnswerOptionRepository from "../repositories/answer-option-repository"
import CustomError from "../utils/custom-error"
import { getBanding } from "../utils/calculate-norms"
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  format,
  isWeekend,
  startOfMonth,
} from "date-fns"
import { EvaluationAdministrationStatus } from "../types/evaluation-administration-type"
import { type Prisma } from "@prisma/client"
import { type UserToken } from "../types/user-token-type"
import { AnswerType } from "../types/answer-type"
import { convertToFullDate } from "../utils/format-date"
import { EvaluationStatus } from "../types/evaluation-type"

export const getAllByFilters = async (
  user: UserToken,
  evaluation_administration_id: string,
  name: string,
  status: string,
  score_ratings_id: string,
  banding: string,
  sort_by: string,
  page: string
) => {
  if (
    !user.roles.includes("kh360") &&
    !user.roles.includes("khv2_cm_admin") &&
    !user.roles.includes("khv2_cm")
  ) {
    throw new CustomError("You do not have permission to view this.", 400)
  }

  const evaluationResultStatus = status === "all" ? "" : status

  const itemsPerPage = 20
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where = {
    status: {
      contains: evaluationResultStatus,
    },
    deleted_at: null,
  }

  if (evaluation_administration_id === undefined || evaluation_administration_id === "all") {
    const evaluationResults = await EvaluationResultRepository.getAllDistinctByFilters(
      {
        status: {
          notIn: [EvaluationResultStatus.NoResult],
        },
        deleted_at: null,
      },
      ["evaluation_administration_id"]
    )
    const evaluationAdministrationIds = evaluationResults.map(
      (evaluationResult) => evaluationResult.evaluation_administration_id
    )
    const evaluationAdministrations =
      await EvaluationAdministrationRepository.getAllByIdsAndStatuses(
        evaluationAdministrationIds as number[],
        [EvaluationAdministrationStatus.Closed, EvaluationAdministrationStatus.Published]
      )
    const finalEvaluationAdministrationIds = evaluationAdministrations.map(
      (evaluationAdministration) => evaluationAdministration.id
    )
    Object.assign(where, {
      evaluation_administration_id: {
        in: finalEvaluationAdministrationIds,
      },
      status: {
        notIn: [EvaluationResultStatus.NoResult],
      },
    })
  } else {
    Object.assign(where, {
      evaluation_administration_id: {
        in: [parseInt(evaluation_administration_id)],
      },
    })
    if (banding !== undefined) {
      Object.assign(where, {
        status: {
          notIn: [EvaluationResultStatus.NoResult],
        },
      })
    }
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

  if (score_ratings_id !== undefined && score_ratings_id !== "all") {
    Object.assign(where, {
      score_ratings_id: parseInt(score_ratings_id),
    })
  }

  if (banding !== undefined && banding !== "all") {
    Object.assign(where, {
      banding,
    })
  }

  const orderBy: Prisma.evaluation_resultsOrderByWithRelationInput[] = []

  if (sort_by === undefined || sort_by === "all") {
    orderBy.push(
      {
        users: {
          last_name: "asc",
        },
      },
      {
        users: {
          first_name: "asc",
        },
      }
    )
  }

  if (sort_by === "score_asc") {
    orderBy.push({
      score: "asc",
    })
  }

  if (sort_by === "score_desc") {
    orderBy.push({
      score: "desc",
    })
  }

  if (sort_by === "standard_score_asc") {
    orderBy.push({
      zscore: "asc",
    })
  }

  if (sort_by === "standard_score_desc") {
    orderBy.push({
      zscore: "desc",
    })
  }

  const evaluationResults = await EvaluationResultRepository.getAllByFiltersWithPaging(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where,
    orderBy
  )

  const finalEvaluationResults = await Promise.all(
    evaluationResults.map(async (evaluationResult) => {
      const evaluation_administration = await EvaluationAdministrationRepository.getById(
        evaluationResult.evaluation_administration_id ?? 0
      )
      return {
        ...evaluationResult,
        score: evaluationResult.score?.toFixed(2),
        zscore: evaluationResult.zscore?.toFixed(2),
        evaluation_administration,
      }
    })
  )

  const totalItems = await EvaluationResultRepository.countAllByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    data: finalEvaluationResults,
    pageInfo: {
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      currentPage,
      totalPages,
      totalItems,
    },
  }
}

export const getById = async (user: UserToken, id: number) => {
  if (
    !user.roles.includes("kh360") &&
    !user.roles.includes("khv2_cm_admin") &&
    !user.roles.includes("khv2_cm")
  ) {
    throw new CustomError("You do not have permission to view this.", 400)
  }

  const evaluationResult = await EvaluationResultRepository.getById(id)

  if (evaluationResult === null) {
    throw new CustomError("Invalid evaluation id.", 400)
  }

  const evaluee = await UserRepository.getById(evaluationResult.user_id ?? 0)
  const evaluationAdministration = await EvaluationAdministrationRepository.getById(
    evaluationResult.evaluation_administration_id ?? 0
  )
  const evaluations = await EvaluationRepository.getAllByFilters({
    evaluation_result_id: evaluationResult.id,
    for_evaluation: true,
  })
  const evaluationIds = evaluations.map((evaluation) => evaluation.id)
  const evaluationTemplateIds = evaluations.map((evaluation) => evaluation.evaluation_template_id)
  const evaluationResultDetails = await EvaluationResultDetailRepository.getAllByFilters({
    evaluation_result_id: evaluationResult.id,
    evaluation_template_id: {
      in: evaluationTemplateIds as number[],
    },
  })

  const finalEvaluationResultDetails = await Promise.all(
    evaluationResultDetails.map(async (detail) => {
      const evaluation_template = await EvaluationTemplateRepository.getById(
        detail.evaluation_template_id ?? 0
      )
      const evaluation_template_contents =
        await EvaluationTemplateContentRepository.getByEvaluationTemplateId(
          evaluation_template?.id ?? 0
        )

      const finalEvaluationTemplateContents = await Promise.all(
        evaluation_template_contents.map(async (content) => {
          const evaluationRatingIds = []
          const evaluationRatings = await EvaluationRatingRepository.getAllByFilters({
            evaluation_template_content_id: content.id,
            evaluation_id: {
              in: evaluationIds,
            },
            evaluation_template_id: detail.evaluation_template_id,
          })
          for (const evaluationRating of evaluationRatings) {
            if (evaluationRating.answer_option_id !== null) {
              const answerOption = await AnswerOptionRepository.getById(
                evaluationRating.answer_option_id
              )
              if (answerOption?.answer_type !== AnswerType.NA) {
                evaluationRatingIds.push(evaluationRating.id)
              }
            }
          }
          const evaluationRatingsAverage =
            await EvaluationRatingRepository.getAverageScoreByTemplateContent(
              {
                rate: true,
              },
              {
                id: {
                  in: evaluationRatingIds,
                },
              }
            )

          const average_rate = Math.round((Number(evaluationRatingsAverage._avg.rate) / 10) * 100)

          return {
            name: content.name,
            description: content.description,
            average_rate,
          }
        })
      )

      const score_rating = await ScoreRatingRepository.getById(detail.score_ratings_id ?? 0)

      return {
        id: detail.id,
        score: detail.score,
        zscore: detail.zscore,
        banding: detail.banding,
        template_name: evaluation_template?.display_name,
        evaluation_template_contents: finalEvaluationTemplateContents,
        total_score: Math.round((Number(detail.score) / 10) * 100),
        score_rating,
        weight: detail.weight,
      }
    })
  )

  if (evaluee === null) {
    throw new CustomError("Evaluee not found", 400)
  }

  if (evaluationAdministration === null) {
    throw new CustomError("Evaluation administration not found", 400)
  }

  if (evaluations === null) {
    throw new CustomError("Evaluations not found", 400)
  }

  const comments = evaluations
    .filter((evaluation) => {
      return evaluation.status === EvaluationStatus.Submitted && Number(evaluation.weight) !== 0
    })
    .map((evaluation) => evaluation.comments)
    .filter((comment) => comment !== null && comment.length > 0)

  const otherEvaluations = evaluations.filter((evaluation) => {
    return (
      (evaluation.status === EvaluationStatus.Submitted && Number(evaluation.weight) === 0) ||
      (evaluation.status !== EvaluationStatus.Submitted &&
        evaluation.status !== EvaluationStatus.Expired)
    )
  })

  const other_comments = await Promise.all(
    otherEvaluations.map(async (evaluation) => {
      const evaluator = await UserRepository.getById(evaluation.evaluator_id ?? 0)
      return { comment: evaluation.comments, evaluator }
    })
  )

  const filteredOtherComments = other_comments.filter((evaluation) => {
    return evaluation.comment !== null && evaluation.comment.length > 0
  })

  const recommendations = evaluations
    .map((evaluation) => evaluation.recommendations)
    .filter((recommendation) => recommendation !== null && recommendation.length > 0)

  const score_rating = await ScoreRatingRepository.getById(evaluationResult.score_ratings_id ?? 0)

  Object.assign(evaluationResult, {
    users: evaluee,
    eval_period_start_date: evaluationAdministration.eval_period_start_date,
    eval_period_end_date: evaluationAdministration.eval_period_end_date,
    comments,
    other_comments: filteredOtherComments,
    recommendations,
    evaluation_result_details: finalEvaluationResultDetails,
    status: evaluationResult.status,
    eval_admin_name: evaluationAdministration.name,
    total_score: Math.round((Number(evaluationResult.score) / 10) * 100),
    score_rating,
    attendance_and_punctuality: await getAttendanceAndPunctuality(evaluationResult.id),
  })

  const previousEvaluationResult = await EvaluationResultRepository.getByFilters(
    {
      id: { lt: evaluationResult?.id },
      evaluation_administration_id: evaluationResult?.evaluation_administration_id,
    },
    {
      id: "desc",
    }
  )

  const nextEvaluationResult = await EvaluationResultRepository.getByFilters(
    {
      id: { gt: evaluationResult?.id },
      evaluation_administration_id: evaluationResult?.evaluation_administration_id,
    },
    {
      id: "asc",
    }
  )

  return {
    data: evaluationResult,
    previousId: previousEvaluationResult?.id,
    nextId: nextEvaluationResult?.id,
  }
}

export const updateById = async (id: number, data: EvaluationResult) => {
  await EvaluationResultRepository.updateById(id, data)
}

export const getAllByEvaluationAdministrationId = async (evaluation_administration_id: number) => {
  return await EvaluationResultRepository.getAllByEvaluationAdministrationId(
    evaluation_administration_id
  )
}

export const updateStatusById = async (id: number, status: string) => {
  const evaluationResult = await EvaluationResultRepository.getById(id)

  if (evaluationResult === null) {
    throw new CustomError("Id not found", 400)
  }

  if (status === EvaluationResultStatus.Ready) {
    const evaluations = await EvaluationRepository.getAllByFilters({
      evaluation_result_id: evaluationResult.id,
      is_external: true,
    })

    for (const evaluation of evaluations) {
      const template = await EvaluationTemplateRepository.getById(
        evaluation.evaluation_template_id ?? 0
      )
      if (template === null) {
        continue
      }
      if (
        evaluation.project_id === null &&
        evaluation.project_member_id === null &&
        template.template_type === "Project Evaluation"
      ) {
        throw new CustomError("Please select a project for an external user.", 400, {
          template_id: template.id,
        })
      }
    }
  }

  return await EvaluationResultRepository.updateStatusById(id, status)
}

export const updateStatusByAdministrationId = async (
  evaluation_administration_id: number,
  status: string
) => {
  await EvaluationResultRepository.updateStatusByAdministrationId(
    evaluation_administration_id,
    status
  )
}

export const calculateScore = async (evaluation_result_id: number) => {
  const currentDate = new Date()
  const evaluationResultDetailsSum =
    await EvaluationResultDetailRepository.aggregateSumByEvaluationResultId(evaluation_result_id, {
      weight: true,
      weighted_score: true,
    })

  const calculated_score =
    Math.round(Number(evaluationResultDetailsSum._sum.weighted_score) * 10000) /
    Math.round(Number(evaluationResultDetailsSum._sum.weight) * 10000)

  const score = isNaN(calculated_score) ? 0 : Math.round(calculated_score * 100) / 100

  await EvaluationResultRepository.updateById(evaluation_result_id, {
    score,
    status: EvaluationResultStatus.Completed,
    updated_at: currentDate,
  })
}

export const calculateZScore = async (evaluation_result_id: number) => {
  const evaluationResultDetailsSum =
    await EvaluationResultDetailRepository.aggregateSumByEvaluationResultId(evaluation_result_id, {
      weight: true,
      weighted_zscore: true,
    })

  let zscore = 0

  if (Number(evaluationResultDetailsSum._sum.weighted_zscore) !== 0) {
    zscore =
      Number(evaluationResultDetailsSum._sum.weighted_zscore) /
      Number(evaluationResultDetailsSum._sum.weight)
  }

  if (Number(evaluationResultDetailsSum._sum.weight) === 0) {
    await EvaluationResultRepository.updateStatusById(
      evaluation_result_id,
      EvaluationResultStatus.NoResult
    )
  }

  await EvaluationResultRepository.updateZScoreById(evaluation_result_id, zscore)

  const evalResult = await EvaluationResultRepository.getById(evaluation_result_id)

  if (evalResult !== null) {
    let banding = ""
    if (Number(evaluationResultDetailsSum._sum.weight) !== 0) {
      banding = getBanding(Number(evalResult.zscore))
    }
    await EvaluationResultRepository.updateBandingById(evalResult.id, banding)
  }
}

export const calculateScoreRating = async (id: number) => {
  const evaluationResult = await EvaluationResultRepository.getById(id)

  if (evaluationResult === null) {
    throw new CustomError("Evaluation result not found", 400)
  }

  const score = evaluationResult.score

  if (score === null) {
    throw new CustomError("Invalid evaluation result score", 400)
  }

  const scoreRating = await ScoreRatingRepository.getByScore(score)

  if (scoreRating === null) {
    throw new CustomError("Score rating not found", 400)
  }

  const evaluationResultDetailsSum =
    await EvaluationResultDetailRepository.aggregateSumByEvaluationResultId(evaluationResult.id, {
      weight: true,
    })

  await EvaluationResultRepository.updateScoreRatingById(
    id,
    Number(evaluationResultDetailsSum._sum.weight) !== 0 ? scoreRating.id : null
  )
}

export const getAttendanceAndPunctuality = async (id: number) => {
  const evaluationResult = await EvaluationResultRepository.getById(id)

  if (evaluationResult === null) {
    throw new CustomError("Evaluation result not found", 400)
  }

  const evaluationAdministration = await EvaluationAdministrationRepository.getById(
    evaluationResult.evaluation_administration_id ?? 0
  )

  if (evaluationAdministration === null) {
    throw new CustomError("Evaluation administration not found", 400)
  }

  const startDate = new Date(evaluationAdministration.eval_period_start_date ?? 0)
  const endDate = new Date(evaluationAdministration.eval_period_end_date ?? 0)

  const monthsArray = eachMonthOfInterval({
    start: startDate,
    end: endDate,
  })

  const finalResults = await Promise.all(
    monthsArray.map(async (month) => {
      const startMonth = startOfMonth(month)
      const endMonth = endOfMonth(month)

      const weekdaysPerMonth = eachDayOfInterval({
        start: startMonth,
        end: endMonth,
      }).filter((day) => !isWeekend(day)).length

      const holidays = await HolidayRepository.getHolidays(startMonth, endMonth)
      const holidaysPerMonth = holidays.filter((day) => day !== null && !isWeekend(day)).length
      const totalWorkingDays = weekdaysPerMonth - holidaysPerMonth

      const convertedHolidays = holidays.map(
        (day) => new Date(convertToFullDate(day ?? new Date()).split("T")[0])
      )

      const allDaysInInterval = eachDayOfInterval({ start: startMonth, end: endMonth })

      const workingDays = allDaysInInterval
        .filter(
          (day) =>
            !isWeekend(day) &&
            convertedHolidays.find((holiday) => holiday.getTime() === new Date(day).getTime()) ===
              undefined
        )
        .map((day) => new Date(format(day, "yyyy-MM-dd")))

      const attendances = await AttendanceRepository.getAttendances(
        evaluationResult.user_id ?? 0,
        workingDays
      )

      const presentWholeDay =
        attendances.find((attendance) => attendance.att_type === 3)?._count.att_type ?? 0
      const presentPm =
        (attendances.find((attendance) => attendance.att_type === 2)?._count.att_type ?? 0) * 0.5
      const presentAm =
        (attendances.find((attendance) => attendance.att_type === 1)?._count.att_type ?? 0) * 0.5
      const daysPresent = presentWholeDay + presentPm + presentAm

      const latesGracePeriod = await AttendanceRepository.getLates(
        evaluationResult.user_id ?? 0,
        startMonth,
        endMonth,
        "Late (within Grace Period)"
      )

      const lates = await AttendanceRepository.getLates(
        evaluationResult.user_id ?? 0,
        startMonth,
        endMonth,
        "Late (Counted)"
      )

      const vacationAndBirthdayLeaves = await LeaveRepository.getLeaves(
        evaluationResult.user_id ?? 0,
        [1, 5]
      )

      const vacationAndBirthdayLeaveDuration = await LeaveBreakdownRepository.getTotalLeaveDuration(
        vacationAndBirthdayLeaves.map((vacationAndBirthdayLeave) => vacationAndBirthdayLeave.id),
        startMonth,
        endMonth
      )

      const sickLeaves = await LeaveRepository.getLeaves(evaluationResult.user_id ?? 0, [2])

      const sickLeaveDuration = await LeaveBreakdownRepository.getTotalLeaveDuration(
        sickLeaves.map((sickLeave) => sickLeave.id),
        startMonth,
        endMonth
      )

      const emergencyLeaves = await LeaveRepository.getLeaves(evaluationResult.user_id ?? 0, [3])

      const emergencyLeaveDuration = await LeaveBreakdownRepository.getTotalLeaveDuration(
        emergencyLeaves.map((emergencyLeave) => emergencyLeave.id),
        startMonth,
        endMonth
      )

      const otherLeaves = await LeaveRepository.getLeaves(
        evaluationResult.user_id ?? 0,
        [6, 7, 9, 10]
      )

      const otherLeaveDuration = await LeaveBreakdownRepository.getTotalLeaveDuration(
        otherLeaves.map((otherLeave) => otherLeave.id),
        startMonth,
        endMonth
      )

      const unpaidLeaves = await LeaveRepository.getLeaves(evaluationResult.user_id ?? 0, [8])

      const unpaidLeaveDuration = await LeaveBreakdownRepository.getTotalLeaveDuration(
        unpaidLeaves.map((unpaidLeave) => unpaidLeave.id),
        startMonth,
        endMonth
      )

      const totalLeaves = await LeaveRepository.getAllLeaves(evaluationResult.user_id ?? 0)

      const totalLeaveDuration = await LeaveBreakdownRepository.getTotalLeaveDuration(
        totalLeaves.map((totalLeave) => totalLeave.id),
        startMonth,
        endMonth
      )

      return {
        month: format(month, "MMMM"),
        total_working_days: totalWorkingDays,
        days_present: daysPresent,
        lates_grace_period: latesGracePeriod,
        lates,
        vacation_and_birthday_leave_duration: vacationAndBirthdayLeaveDuration._sum.duration ?? 0,
        sick_leave_duration: sickLeaveDuration._sum.duration ?? 0,
        emergency_leave_duration: emergencyLeaveDuration._sum.duration ?? 0,
        other_leave_duration: otherLeaveDuration._sum.duration ?? 0,
        unpaid_leave_duration: unpaidLeaveDuration._sum.duration ?? 0,
        unfiled_leave_duration:
          totalWorkingDays - daysPresent - Number(totalLeaveDuration._sum.duration ?? 0),
      }
    })
  )

  return finalResults
}

export const getEvaluatorsById = async (user: UserToken, id: number) => {
  if (
    !user.roles.includes("kh360") &&
    !user.roles.includes("khv2_cm_admin") &&
    !user.roles.includes("khv2_cm")
  ) {
    throw new CustomError("You do not have permission to view this.", 400)
  }

  const evaluationResult = await EvaluationResultRepository.getById(id)

  if (evaluationResult === null) {
    throw new CustomError("Invalid id.", 400)
  }

  const evaluationAdministration = await EvaluationAdministrationRepository.getById(
    evaluationResult.evaluation_administration_id ?? 0
  )

  if (evaluationAdministration === null) {
    throw new CustomError("Evaluation administration not found.", 400)
  }

  const evaluators = []
  const internalEvaluations = await EvaluationRepository.getAllDistinctByFilters(
    {
      evaluation_result_id: id,
      for_evaluation: true,
    },
    ["evaluator_id"]
  )

  for (const evaluation of internalEvaluations) {
    const evaluator = await UserRepository.getById(evaluation.evaluator_id ?? 0)

    if (evaluator !== null) {
      evaluators.push({
        ...evaluator,
      })
    }
  }

  const externalEvaluations = await EvaluationRepository.getAllDistinctByFilters(
    {
      evaluation_result_id: id,
      for_evaluation: true,
    },
    ["external_evaluator_id"]
  )

  for (const evaluation of externalEvaluations) {
    const evaluator = await ExternalUserRepository.getById(evaluation.external_evaluator_id ?? 0)

    if (evaluator !== null) {
      evaluators.push({
        ...evaluator,
      })
    }
  }

  for (const evaluator of evaluators) {
    const evaluations = await EvaluationRepository.getAllByFilters({
      evaluator_id: evaluator.id,
      eval_start_date: { gte: evaluationAdministration.eval_period_start_date ?? new Date() },
      eval_end_date: { lte: evaluationAdministration.eval_period_end_date ?? new Date() },
      for_evaluation: true,
    })
    const finalEvaluations = await Promise.all(
      evaluations.map(async (evaluation) => {
        const evaluee = await UserRepository.getById(evaluation.evaluee_id ?? 0)
        const project = await ProjectRepository.getById(evaluation.project_id ?? 0)
        const project_role = await ProjectRoleRepository.getById(
          evaluation.project_members?.project_role_id ?? 0
        )

        Object.assign(evaluation, {
          evaluee,
          project,
          project_role,
        })
        return evaluation
      })
    )

    Object.assign(evaluator, {
      evaluations: finalEvaluations,
    })
  }

  return evaluators
}

export const deleteEvaluationResult = async (id: number) => {
  const evaluationResult = await EvaluationResultRepository.getById(id)

  if (evaluationResult === null) {
    throw new CustomError("Evaluation result not found.", 400)
  }

  const evaluations = await EvaluationRepository.getAllByFilters({
    evaluation_result_id: evaluationResult.id,
    status: {
      notIn: [
        EvaluationStatus.Draft,
        EvaluationStatus.Excluded,
        EvaluationStatus.Pending,
        EvaluationStatus.Open,
      ],
    },
  })

  if (evaluations.length > 0) {
    throw new CustomError("You are not allowed to delete this evaluee.", 400)
  }

  await EvaluationResultRepository.deleteById(evaluationResult.id)
  await EvaluationRepository.deleteByEvaluationResultId(evaluationResult.id)
}
