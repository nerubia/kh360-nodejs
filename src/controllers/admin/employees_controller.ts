import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const { name, user_type, page } = req.query

    const userType = user_type === "all" ? "" : user_type

    const itemsPerPage = 20
    const parsedPage = parseInt(page as string)
    const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

    const where = {
      is_active: true,
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
        ]
      })
    }
    
    const employees = await prisma.users.findMany({
      skip: (currentPage - 1) * itemsPerPage,
      take: itemsPerPage,
      where,
      orderBy: [
        {
          last_name: "asc",
        },
        {
          first_name: "asc",
        },
      ],
    });
    const user_details = await prisma.user_details.findMany({
      select: {
        user_id: true,
        start_date: true,
        user_type: true,
        user_position: true,
      },
      where: {
        user_type: {
          contains: userType as string,
        },
      },
    })

    const employeeList = employees.map((employee) => {
    const userDetail = user_details.find((detail) => detail.user_id === employee.id);
    if (userDetail) {
      return {
        id: employee.id,
        email: employee.email,
        first_name: employee.first_name,
        last_name: employee.last_name,
        is_active: employee.is_active,
        user_type: userDetail?.user_type,
        user_position: userDetail?.user_position,
        start_date: userDetail?.start_date,
      };
    }
    return null
  }).filter((employee) => employee !== null)

    const totalItems = employeeList.length

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    res.json({
      data: employeeList,
      pageInfo: {
        hasPreviousPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
        totalPages,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}