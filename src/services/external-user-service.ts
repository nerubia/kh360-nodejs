import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import { nanoid } from "nanoid"
import { type Prisma } from "@prisma/client"
import * as ExternalUserRepository from "../repositories/external-user-repository"
import { type ExternalUser } from "../types/external-user-type"
import CustomError from "../utils/custom-error"
import { sendMail } from "../utils/sendgrid"

export const login = async (token: string, code: string) => {
  const externalUser = await ExternalUserRepository.getByAccessToken(token)

  if (externalUser === null) {
    throw new CustomError("Invalid credentials", 400)
  }

  if (externalUser.code !== code) {
    await ExternalUserRepository.updateFailedAttemptsById(
      externalUser.id,
      (externalUser.failed_attempts ?? 0) + 1
    )
    throw new CustomError("Invalid credentials", 400)
  }

  const access_token = jwt.sign(
    {
      id: externalUser.id,
      email: externalUser.email,
      first_name: externalUser.first_name,
      last_name: externalUser.last_name,
      is_external: true,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
    }
  )

  return {
    access_token,
    user: {
      id: externalUser.id,
      email: externalUser.email,
      first_name: externalUser.first_name,
      last_name: externalUser.last_name,
      role: externalUser.role,
      company: externalUser.company,
      is_external: true,
    },
  }
}

export const resendCodeByAccessToken = async (token: string) => {
  const externalUser = await ExternalUserRepository.getByAccessToken(token)

  if (externalUser === null) {
    throw new CustomError("Invalid credentials", 400)
  }

  const code = await generateCode()

  await ExternalUserRepository.updateCodeById(externalUser.id, code)

  await sendMail(externalUser.email, "Verification code", `Your new code is <b>${code}</b>`)
}

export const getLockedAtByAccessToken = async (token: string) => {
  const externalUser = await ExternalUserRepository.getByAccessToken(token)

  if (externalUser === null) {
    throw new CustomError("Invalid credentials", 400)
  }

  return externalUser.locked_at
}

export const getAll = async () => {
  return await ExternalUserRepository.getAll()
}

export const getAllByFilters = async (
  name: string,
  company: string,
  role: string,
  page: string
) => {
  const evaluatorRole = role === "all" ? "" : role

  const itemsPerPage = 10
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where = {
    role: {
      contains: evaluatorRole,
    },
    company: {
      contains: company,
    },
  }

  if (name !== undefined) {
    Object.assign(where, {
      OR: [
        {
          first_name: {
            contains: name,
          },
        },
        {
          middle_name: {
            contains: name,
          },
        },
        {
          last_name: {
            contains: name,
          },
        },
      ],
    })
  }

  const totalItems = await ExternalUserRepository.countByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const externalUsers = await ExternalUserRepository.getAllByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const pageInfo = {
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    totalPages,
    totalItems,
  }

  return {
    data: externalUsers,
    pageInfo,
  }
}

export const countByFilters = async (where: Prisma.external_usersWhereInput) => {
  return await ExternalUserRepository.countByFilters(where)
}

export const create = async (data: ExternalUser) => {
  const existingUser = await ExternalUserRepository.getByEmail(data.email)

  if (existingUser !== null) {
    throw new CustomError("Email already exist.", 400)
  }

  return await ExternalUserRepository.create({
    email: data.email,
    first_name: data.first_name,
    middle_name: data.middle_name,
    last_name: data.last_name,
    role: data.role,
    company: data.company,
    access_token: await generateToken(),
    code: await generateCode(),
    failed_attempts: 0,
    created_by_id: data.created_by_id,
    updated_by_id: data.updated_by_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
  })
}

export const getById = async (id: number) => {
  return await ExternalUserRepository.getById(id)
}

export const updateById = async (id: number, data: ExternalUser) => {
  return await ExternalUserRepository.updateById(id, data)
}

export const deleteById = async (id: number) => {
  await ExternalUserRepository.deleteById(id)
}

export const generateToken = async () => {
  let uuid
  do {
    uuid = uuidv4()
  } while ((await ExternalUserRepository.getByAccessToken(uuid)) != null)
  return uuid
}

export const generateCode = async () => {
  let code
  do {
    code = nanoid()
  } while ((await ExternalUserRepository.getByCode(code)) != null)
  return code
}
