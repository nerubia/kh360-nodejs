import { type Request, type Response } from "express"
import jwt from "jsonwebtoken"
import * as ExternalUserRepository from "../../repositories/external-user-repository"
import * as UserRepository from "../../repositories/user-repository"
import { type UserToken } from "../../types/user-token-type"
import prisma from "../../utils/prisma"

export const refreshToken = async (req: Request, res: Response) => {
  const cookies = req.cookies
  if (cookies.jwt === undefined) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  jwt.verify(
    cookies.jwt,
    process.env.REFRESH_TOKEN_SECRET as string,
    async (error: unknown, decoded: unknown) => {
      if (error != null) return res.status(403).json({ message: "Forbidden" })
      const decodedToken = decoded as UserToken

      const user = await UserRepository.getByEmail(decodedToken.email)
      const external_user = await ExternalUserRepository.getByEmail(decodedToken.email)

      const existingUser = decodedToken.is_external ? external_user : user

      if (existingUser === null) return res.status(403).json({ message: "Forbidden" })

      let roles

      if (!decodedToken.is_external) {
        const userRoles = await prisma.user_roles.findMany({
          where: {
            user_id: existingUser.id,
          },
        })
        roles = userRoles.map((role) => role.name)
      }

      const access_token = jwt.sign(
        {
          id: existingUser.id,
          email: existingUser.email,
          first_name: existingUser.first_name,
          last_name: existingUser.last_name,
          roles,
          is_external: decodedToken.is_external,
          user_details: user?.user_details,
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
        }
      )

      res.json({
        access_token,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          first_name: existingUser.first_name,
          last_name: existingUser.last_name,
          roles,
          is_external: decodedToken.is_external,
          user_details: user?.user_details,
          user_settings: user?.user_settings,
        },
      })
    }
  )
}
