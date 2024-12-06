import * as SystemSettingsRepository from "../repositories/system-settings-repository"
import CustomError from "../utils/custom-error"

export const getByName = async (name: string) => {
  const systemSettings = await SystemSettingsRepository.getByName(name)

  if (systemSettings === null) {
    throw new CustomError("System settings not found", 400)
  }

  return systemSettings
}
