import * as ClientRepository from "../repositories/client-repository"

export const getActiveClients = async () => {
  return await ClientRepository.getAllByFilters({
    status: "Active",
  })
}
