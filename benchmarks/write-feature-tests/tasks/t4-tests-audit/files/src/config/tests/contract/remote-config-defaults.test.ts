import { describe, expect, it } from "vitest"

import {
  bakedRemoteConfigDefaults,
  loadBakedConfig,
  remoteConfigSchemas,
  type RemoteConfigName,
} from "../../remote-config"

const configNames = Object.keys(remoteConfigSchemas) as RemoteConfigName[]

function sortedKeys(value: unknown): string[] {
  return typeof value === "object" && value !== null ? Object.keys(value).sort() : []
}

describe("baked remote config defaults", () => {
  it("has one default for every schema and one schema for every default", () => {
    expect(sortedKeys(bakedRemoteConfigDefaults)).toEqual(sortedKeys(remoteConfigSchemas))
  })

  it.each(configNames)("%s default has exactly the schema keys", (name) => {
    expect(sortedKeys(bakedRemoteConfigDefaults[name])).toEqual(sortedKeys(remoteConfigSchemas[name].shape))
  })

  it.each(configNames)("%s default parses through the production loader", (name) => {
    expect(() => loadBakedConfig(name)).not.toThrow()
  })
})
