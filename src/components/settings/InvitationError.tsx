
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { InvitationErrorProps } from "./types"

export function InvitationError({ errorMessage, errorDetails }: InvitationErrorProps) {
  if (!errorMessage) return null

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {errorMessage}
        {errorDetails && (
          <div className="mt-2 text-sm">
            <p>{errorDetails}</p>
            <a 
              href="https://resend.com/domains" 
              target="_blank"
              rel="noreferrer"
              className="underline mt-1 inline-block"
            >
              Verify Domain on Resend
            </a>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}
