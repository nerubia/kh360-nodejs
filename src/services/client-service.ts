import * as ClientRepository from "../repositories/client-repository"
import { getCache, setCache } from "../utils/redis"

const KEY = "CLIENTS"

export const getActiveClients = async () => {
  let results = await getCache(KEY)

  if (results === null) {
    results = await ClientRepository.getAllByFilters({
      status: "Active",
    })
    await setCache(KEY, results)
  }

  return results
}
