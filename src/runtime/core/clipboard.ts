export interface ClipboardWriter {
  writeText(value: string): Promise<void>
}

/** Clipboard denial is recoverable because the UI exposes a manual-copy field. */
export async function attemptNuxtJpClipboardCopy(
  value: string,
  clipboard?: ClipboardWriter
): Promise<'copied' | 'manual'> {
  if (!value || !clipboard) return 'manual'
  try {
    await clipboard.writeText(value)
    return 'copied'
  } catch {
    return 'manual'
  }
}
