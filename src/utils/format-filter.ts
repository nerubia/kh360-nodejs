export const constructNameFilter = (name: string) => {
  const OR = [{}]

  if (name.includes(",")) {
    const [lastName, firstName, middleName] = name.split(",")

    addSearchConditions(OR, firstName, lastName, middleName)
  } else {
    const [lastName, firstName, middleName] = name.split(" ")
    addSearchConditions(OR, firstName, lastName, middleName)
  }

  return { OR }
}

const addSearchConditions = (
  OR: Array<Record<string, unknown>>,
  firstName?: string,
  lastName?: string,
  middleName?: string
) => {
  if (firstName !== undefined && firstName.length > 0) {
    OR.push({
      OR: [
        {
          first_name: {
            contains: firstName,
          },
        },
        {
          middle_name: {
            contains: firstName,
          },
        },
        {
          last_name: {
            contains: firstName,
          },
        },
      ],
    })
  }

  if (lastName !== undefined && lastName.length > 0) {
    OR.push({
      OR: [
        {
          first_name: {
            contains: lastName,
          },
        },
        {
          middle_name: {
            contains: lastName,
          },
        },
        {
          last_name: {
            contains: lastName,
          },
        },
      ],
    })
  }

  if (middleName !== undefined && middleName.length > 0) {
    OR.push({
      OR: [
        {
          first_name: {
            contains: middleName,
          },
        },
        {
          middle_name: {
            contains: middleName,
          },
        },
        {
          last_name: {
            contains: middleName,
          },
        },
      ],
    })
  }
}
