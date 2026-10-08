import { z } from "zod"

/** Schemas for every remote-config document the app reads. */
export const remoteConfigSchemas = {
  taskLimits: z.object({
    maxSubtasks: z.number().int().positive(),
    archiveAfterDays: z.number().int().positive(),
  }),
  notifications: z.object({
    digestHour: z.number().int().min(0).max(23),
    mentionEmails: z.boolean(),
  }),
}

export type RemoteConfigName = keyof typeof remoteConfigSchemas

export type RemoteConfig<Name extends RemoteConfigName> = z.infer<(typeof remoteConfigSchemas)[Name]>

/** Shipped with the app and used whenever the remote fetch fails or has not finished. */
export const bakedRemoteConfigDefaults: Record<RemoteConfigName, unknown> = {
  taskLimits: { maxSubtasks: 20, archiveAfterDays: 90 },
  notifications: { digestHour: 8, mentionEmails: true },
}

export function loadBakedConfig<Name extends RemoteConfigName>(name: Name): RemoteConfig<Name> {
  return remoteConfigSchemas[name].parse(bakedRemoteConfigDefaults[name]) as RemoteConfig<Name>
}
