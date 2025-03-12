
import { CheckCircle } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { InvitationConfirmationProps } from "./types"

export function InvitationConfirmation({ isOpen, setIsOpen, email }: InvitationConfirmationProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Invitation Sent Successfully
          </AlertDialogTitle>
          <AlertDialogDescription>
            An invitation has been sent to <span className="font-medium">{email}</span>. 
            They will receive an email with instructions on how to join your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
