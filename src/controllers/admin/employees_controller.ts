import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.users.findMany()
    const list = employees.map((employee) => {
      return {
        id: employee.id,
        email: employee.email,
        firstName: employee.first_name,
        lastName: employee.last_name,
      }
    })
    res.json(list)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
