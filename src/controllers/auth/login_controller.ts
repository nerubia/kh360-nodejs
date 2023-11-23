import { type Request, type Response } from "express"
import axios from "axios"
import jwt from "jsonwebtoken"
import ms from "ms"
import prisma from "../../utils/prisma"

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Send data to KH api
    const response = await axios.post(
      "https://kaishahero.com/users/sign_in.json",
      {
        "user[email]": email,
        "user[password]": password,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )

    const data = response.data

    const existingUser = await prisma.users.findUnique({
      where: {
        email: data.email,
      },
    })

    if (existingUser === null) return res.status(400).json({ message: "Invalid credentials" })

    const userRoles = await prisma.user_roles.findMany({
      where: {
        user_id: existingUser.id,
      },
    })

    const roles = userRoles.map((role) => role.name)

    const access_token = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
        first_name: existingUser.first_name,
        last_name: existingUser.last_name,
        roles,
        is_external: false,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
      }
    )

    const refreshToken = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
        first_name: existingUser.first_name,
        last_name: existingUser.last_name,
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
      }
    )

    res.cookie("jwt", refreshToken, {
      httpOnly: true, // accessible by web server only
      maxAge: ms(process.env.REFRESH_TOKEN_EXPIRATION as string),
      secure: true, // Set to true if using HTTPS
      sameSite: "none", // Set to 'none' if using cross-site requests
    })

    res.json({
      access_token,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        first_name: existingUser.first_name,
        last_name: existingUser.last_name,
        roles,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
