import { array, boolean, number, object, string } from "yup"

export const createOfferingSchema = object().shape({
  name: string().required("Name is required"),
  client_id: number().required("Client is required"),
  offering_category_id: number().required("Category is required"),
  currency_id: number().required("Currency is required"),
  price: number().required("Price is required"),
  description: string().optional(),
  is_active: boolean().required(),
})

export const offeringOrderBySchema = array().of(
  object()
    .shape({
      name: string().oneOf(["asc", "desc"]).optional(),
      created_at: string().oneOf(["asc", "desc"]).optional(),
    })
    .test(
      "only-one-field",
      'Object must contain either "name" or "created_at", but not both',
      function (value) {
        const hasName = value?.name !== undefined
        const hasCreatedAt = value?.created_at !== undefined
        return (hasName && !hasCreatedAt) || (!hasName && hasCreatedAt)
          ? true
          : this.createError({
              message: 'Object must contain either "name" or "created_at", but not both',
            })
      }
    )
)

export const offeringSchema = object().shape({
  orderBy: offeringOrderBySchema,
})
