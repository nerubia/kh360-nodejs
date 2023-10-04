import { type Request, type Response } from "express"
import jwt from "jsonwebtoken"

interface DecodedToken {
  email: string
  firstName: string
  lastName: string
}

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
      const decodedToken = decoded as DecodedToken
      const accessToken = jwt.sign(
        {
          email: decodedToken.email,
          firstName: decodedToken.firstName,
          lastName: decodedToken.lastName,
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        {
          expiresIn: "5m",
        }
      )
      res.json({
        accessToken,
        user: {
          email: decodedToken.email,
          firstName: decodedToken.firstName,
          lastName: decodedToken.lastName,
        },
      })
    }
  )
}
