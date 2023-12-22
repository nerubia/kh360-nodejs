import { LeaveStatus } from "../types/leave-type"
import prisma from "../utils/prisma"

export const getLeaves = async (user_id: number, leaveTypeIds: number[]) => {
  return await prisma.leaves.findMany({
    where: {
      user_id,
      leave_type_id: {
        in: leaveTypeIds,
      },
      status: {
        in: [LeaveStatus.Approved, LeaveStatus.Pending, LeaveStatus.Taken],
      },
    },
  })
}

export const getAllLeaves = async (user_id: number) => {
  return await prisma.leaves.findMany({
    where: {
      user_id,
      status: {
        in: [LeaveStatus.Approved, LeaveStatus.Pending, LeaveStatus.Taken],
      },
    },
  })
}
