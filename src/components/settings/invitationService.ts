
import { supabase } from "@/integrations/supabase/client"
import { UserAccount } from "@/services/connection/types"

type InvitationResult = {
  success: boolean;
  error?: string;
  details?: string;
}

export async function sendInvitation(
  email: string,
  type: "store" | "maintenance",
  currentUser: UserAccount,
  setErrorMessage: (message: string | null) => void,
  setErrorDetails: (details: string | null) => void
): Promise<InvitationResult> {
  try {
    if (!email || !email.trim()) {
      const errorMsg = "Email address is required";
      console.error(errorMsg);
      setErrorMessage(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorMsg = "Invalid email format";
      console.error(errorMsg);
      setErrorMessage(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    console.log(`Sending invitation to ${email} as ${type} from user ${currentUser.id} (${currentUser.name})`);
    
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
    
    if (!response.data) {
      const errorMsg = "No response from invitation service";
      console.error(errorMsg);
      setErrorMessage(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    console.log("Invitation service response:", response.data);
    
    if (!response.data?.success) {
      // Check if it's a development mode error
      if (response.data?.details) {
        console.warn("Development mode error:", response.data?.error);
        console.warn("Details:", response.data?.details);
        setErrorMessage(response.data?.error || "Failed to send invitation");
        setErrorDetails(response.data?.details);
        return { 
          success: false, 
          error: response.data?.error || "Failed to send invitation",
          details: response.data?.details
        };
      } else {
        const errorMsg = response.data?.error || "Failed to send invitation";
        console.error(errorMsg);
        setErrorMessage(errorMsg);
        return { success: false, error: errorMsg };
      }
    }
    
    console.log(`Invitation sent successfully to ${email}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error in sendInvitation service:", error);
    
    // Provide more detailed error logging
    if (error instanceof Error) {
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    
    // Network-related errors
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      const errorMsg = "Network error: Please check your internet connection";
      setErrorMessage(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    // Timeouts
    if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
      const errorMsg = "Request timed out: The server took too long to respond";
      setErrorMessage(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    setErrorMessage(error.message || "An unexpected error occurred");
    return { 
      success: false, 
      error: error.message || "An unexpected error occurred" 
    };
  }
}
