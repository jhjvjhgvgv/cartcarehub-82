import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Cart } from "@/types/cart";
import { updateCart, createCart } from "@/api/carts/cart-api";
import { useToast } from "@/hooks/use-toast";


interface CartFormData {
  qr_token?: string;
  asset_tag?: string;
  store_org_id: string;
  status: "in_service" | "out_of_service" | "retired";
  model?: string;
  notes?: string;
}

interface CartMutationParams {
  data: CartFormData | CartFormData[];
  editingCart?: Cart | null;
}

export const useCartSubmit = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: handleSubmit, isPending } = useMutation({
    mutationFn: async (params: CartMutationParams) => {
      const { data, editingCart } = params;

      try {
        if (Array.isArray(data)) {
          // Bulk update
          const updatePromises = data.map((update) => {
            const cart = queryClient
              .getQueryData<Cart[]>(["carts"])
              ?.find((c) => c.id === (update as any).id);
            if (!cart) return null;

            return updateCart(cart.id, {
              status: update.status,
              model: update.model,
              notes: update.notes,
              asset_tag: update.asset_tag,
            });
          });

          await Promise.all(updatePromises.filter(Boolean));
          return { success: true, message: "Carts have been updated successfully." };
        }

        if (editingCart) {
          // Single cart update
          await updateCart(editingCart.id, {
            status: data.status,
            model: data.model,
            notes: data.notes,
            asset_tag: data.asset_tag,
          });
          return { success: true, message: "Cart has been updated successfully." };
        }

        // NOTE: client-side duplicate check removed.
        // The DB UNIQUE constraint on carts.qr_token is now the single source of truth;
        // createCart() surfaces the 23505 error as a friendly message.

        // Create new cart – createCart enforces qr_token format + normalizes asset_tag.
        await createCart({
          qr_token: data.qr_token,
          store_org_id: data.store_org_id,
          status: data.status,
          model: data.model || null,
          notes: data.notes || null,
          asset_tag: data.asset_tag || null,
        });
        return { success: true, message: "New cart has been created successfully." };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["carts"] });
      toast({
        title: "Success",
        description: result.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating the cart.",
        variant: "destructive",
      });
    },
  });

  return { handleSubmit, isPending };
};
