import { type Request, type Response, type NextFunction } from "express"
import jwt from "jsonwebtoken"
import { type UserToken } from "../types/user_token"
import prisma from "../utils/prisma"

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  if (authHeader == null) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  const token = authHeader.split(" ")[1]
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
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

      const userRoles = await prisma.user_roles.findMany({
        where: {
          user_id: existingUser.id,
        },
      })

      const roles = userRoles.map((role) => role.name)

      if (!roles.includes("kh360"))
        return res.status(403).json({ message: "PermissionError" })

      req.user = decodedToken
      next()
    }
  )
}
