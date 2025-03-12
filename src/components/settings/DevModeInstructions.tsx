
export function DevModeInstructions({ show }: { show: boolean }) {
  if (!show) return null
  
  return (
    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
      <p className="font-medium mb-1">Development Mode</p>
      <p>
        For testing, use your own email address registered with Resend.
        For production, <a href="https://resend.com/domains" target="_blank" rel="noreferrer" className="underline">verify a domain</a> in Resend.
      </p>
    </div>
  )
}
