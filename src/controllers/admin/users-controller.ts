import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"

/**
 * List users based on provided filters.
 * @param req.query.name - Filter by name.
 * @param req.query.user_type - Filter by user type.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { name, user_type, page } = req.query

    const userType = user_type === "all" ? "" : user_type

    const itemsPerPage = 20
    const parsedPage = parseInt(page as string)
    const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

    const where = {
      is_active: true,
      user_details: {
        user_type: {
          contains: userType as string,
        },
      },
    }

    if (name !== undefined) {
      Object.assign(where, {
        OR: [
          {
            first_name: {
              contains: name as string,
            },
          },
          {
            last_name: {
              contains: name as string,
            },
          },
        ],
      })
    }

    const employees = await prisma.users.findMany({
      skip: (currentPage - 1) * itemsPerPage,
      take: itemsPerPage,
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        is_active: true,
        user_details: {
          select: {
            id: true,
            user_id: true,
            start_date: true,
            user_type: true,
            user_position: true,
          },
        },
      },
      where,
      orderBy: [
        {
          last_name: "asc",
        },
        {
          first_name: "asc",
        },
      ],
    })

    const totalItems = await prisma.users.count({
      where,
    })

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    res.json({
      data: employees,
      pageInfo: {
        currentPage,
        hasPreviousPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
        totalPages,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

// TODO: Refactor
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        is_active: true,
        user_details: {
          select: {
            id: true,
            user_id: true,
            start_date: true,
            user_type: true,
            user_position: true,
          },
        },
      },
      where: {
        is_active: true,
      },
      orderBy: [
        {
          last_name: "asc",
        },
        {
          first_name: "asc",
        },
      ],
    })

    res.json({
      data: employees,
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
