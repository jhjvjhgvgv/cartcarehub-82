
import { supabase } from "@/integrations/supabase/client"
import { UserAccount } from "@/services/connection/types"

type InvitationResult = {
  success: boolean;
  error?: string;
}

export async function sendInvitation(
  email: string,
  type: "store" | "maintenance",
  currentUser: UserAccount,
  setErrorMessage: (message: string | null) => void,
  setErrorDetails: (details: string | null) => void
): Promise<InvitationResult> {
  try {
    // Call our edge function to send the invitation email
    const response = await supabase.functions.invoke('send-invitation', {
      body: {
        email: email,
        type: type,
        invitedBy: {
          id: currentUser.id,
          name: currentUser.name,
          type: currentUser.type
        }
      }
    });
    
    if (!response.data?.success) {
      // Check if it's a development mode error
      if (response.data?.details) {
        setErrorMessage(response.data?.error || "Failed to send invitation");
        setErrorDetails(response.data?.details);
        throw new Error(response.data?.error || "Failed to send invitation");
      } else {
        throw new Error(response.data?.error || "Failed to send invitation");
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error in sendInvitation service:", error);
    return { 
      success: false, 
      error: error.message || "An unexpected error occurred" 
    };
  }
}
