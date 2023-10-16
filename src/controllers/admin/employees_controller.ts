import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.users.findMany()
    const list = employees.map((employee) => {
      return {
        id: employee.id,
        email: employee.email,
        first_name: employee.first_name,
        last_name: employee.last_name,
        is_active: employee.is_active,
      }
    })
    res.json(list)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
