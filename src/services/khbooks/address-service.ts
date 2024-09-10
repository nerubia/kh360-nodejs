import { type Address } from "../../types/address-type"
import * as AddressRepository from "../../repositories/khbooks/address-repository"

export const create = async (data: Address) => {
  const currentDate = new Date()

  return await AddressRepository.create({
    address1: data.address1,
    address2: data.address2,
    city: data.city,
    state: data.state,
    country: data.country,
    postal_code: data.postal_code,
    created_at: currentDate,
    updated_at: currentDate,
  })
}
