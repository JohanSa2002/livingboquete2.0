// Anti-spam fields every public lead form sends along (checked in
// server/api/leads.post.ts): a honeypot input people never see, and how long
// the form has been on screen. Bots fill every field and submit instantly.
export function useLeadGuard() {
  const trap = ref('')
  let startedAt = 0
  onMounted(() => { startedAt = Date.now() })

  // Restart the clock when a form is reopened (the rental request modal stays
  // mounted between openings).
  const restart = () => { startedAt = Date.now() }

  const fields = () => ({
    website: trap.value,
    elapsed_ms: startedAt ? Date.now() - startedAt : 0,
  })

  return { trap, restart, fields }
}
