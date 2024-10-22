import * as CompanyRepository from "../repositories/company-repository"

export const getById = async (id: number) => {
  return await CompanyRepository.getById(id)
}
