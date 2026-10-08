/** Narrows an untrusted string (URL param, storage value) to one of the allowed options. */
export function includesOption<Option extends string>(options: readonly Option[], value: string): value is Option {
  return (options as readonly string[]).includes(value)
}
