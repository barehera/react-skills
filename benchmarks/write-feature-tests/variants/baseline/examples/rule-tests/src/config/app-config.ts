import { z } from "zod"

export const appConfigSchemas = {
  supportRequest: z.object({
    maxAttachmentMb: z.number().int().positive(),
    liveChatEnabled: z.boolean(),
  }),
  releaseNotes: z.object({
    visibleEntries: z.number().int().positive(),
  }),
}

export type AppConfigName = keyof typeof appConfigSchemas

export type AppConfig<Name extends AppConfigName> = z.infer<(typeof appConfigSchemas)[Name]>

export const bakedAppConfigDefaults: Record<AppConfigName, unknown> = {
  supportRequest: { maxAttachmentMb: 10, liveChatEnabled: false },
  releaseNotes: { visibleEntries: 5 },
}

export function loadDefaultAppConfig<Name extends AppConfigName>(name: Name): AppConfig<Name> {
  return appConfigSchemas[name].parse(bakedAppConfigDefaults[name]) as AppConfig<Name>
}
