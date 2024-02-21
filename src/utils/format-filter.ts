export const constructNameFilter = (name: string) => {
  const cleanedName = name.replace(/[^a-zA-Z0-9 ñ-]/g, "")

  const splitQuery = cleanedName.split(" ")

  if (splitQuery.length > 1) {
    const AND = []
    for (const word of splitQuery) {
      AND.push({
        OR: [
          {
            first_name: {
              contains: word,
            },
          },
          {
            last_name: {
              contains: word,
            },
          },
          {
            middle_name: {
              contains: word,
            },
          },
        ],
      })
    }

    return { AND }
  } else {
    const OR = [
      {
        first_name: {
          contains: name,
        },
      },
      {
        last_name: {
          contains: name,
        },
      },
      {
        middle_name: {
          contains: name,
        },
      },
    ]
    return { OR }
  }
}
