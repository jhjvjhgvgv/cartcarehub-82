
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StoreForm } from "./StoreForm";
import { type ManagedStore, type StoreFormData } from "../types/store";

interface StoreFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StoreFormData) => void;
  editingStore: ManagedStore | null;
}

export function StoreFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editingStore
}: StoreFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingStore ? "Edit Store" : "Add New Store"}
          </DialogTitle>
        </DialogHeader>
        <StoreForm
          initialData={editingStore}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
