import { type Request, type Response } from "express"
import jwt from "jsonwebtoken"
import { type UserToken } from "../../types/user_token"
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

      const existingUser = await prisma.users.findUnique({
        where: {
          email: decodedToken.email,
        },
      })

      if (existingUser === null)
        return res.status(403).json({ message: "Forbidden" })

      const accessToken = jwt.sign(
        {
          id: existingUser.id,
          email: existingUser.email,
          firstName: existingUser.first_name,
          lastName: existingUser.last_name,
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
        }
      )

      const userRoles = await prisma.user_roles.findMany({
        where: {
          user_id: existingUser.id,
        },
      })

      res.json({
        accessToken,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          firstName: existingUser.first_name,
          lastName: existingUser.last_name,
          roles: userRoles.map((role) => role.name),
        },
      })
    }
  )
}
