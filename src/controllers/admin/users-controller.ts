import { type Request, type Response } from "express"
import * as UserService from "../../services/user-service"

/**
 * List users based on provided filters.
 * @param req.query.name - Filter by name.
 * @param req.query.user_type - Filter by user type.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { name, user_type, page } = req.query

    const users = await UserService.getAllByFilters(
      name as string,
      user_type as string,
      page as string
    )

    res.json(users)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const employees = await UserService.getAll()

    res.json(employees)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const getUserSkillMap = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user_skill_map = await UserService.getUserSkillMap(parseInt(id))
    res.json(user_skill_map)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
