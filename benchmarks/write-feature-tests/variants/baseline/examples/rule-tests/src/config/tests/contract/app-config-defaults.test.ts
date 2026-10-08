import { describe, expect, it } from "vitest"
import {
  appConfigSchemas,
  bakedAppConfigDefaults,
  loadDefaultAppConfig,
  type AppConfigName,
} from "../../app-config"

const configNames = Object.keys(appConfigSchemas) as AppConfigName[]

function sortedKeys(value: unknown): string[] {
  return typeof value === "object" && value !== null ? Object.keys(value).sort() : []
}

describe("baked app config defaults", () => {
  it("has one default for every schema and one schema for every default", () => {
    expect(sortedKeys(bakedAppConfigDefaults)).toEqual(sortedKeys(appConfigSchemas))
  })

  it.each(configNames)("%s default has exactly the schema keys", name => {
    expect(sortedKeys(bakedAppConfigDefaults[name])).toEqual(sortedKeys(appConfigSchemas[name].shape))
  })

  it.each(configNames)("%s default parses through the production loader", name => {
    expect(() => loadDefaultAppConfig(name)).not.toThrow()
  })
})
