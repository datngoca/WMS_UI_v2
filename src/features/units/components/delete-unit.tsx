import { Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { useNotifications } from "@/components/ui/notifications";

import { useDeleteUnit } from "../api/delete-unit";

type DeleteUnitProps = {
  unitId: number;
};

export const DeleteUnit = ({ unitId }: DeleteUnitProps) => {
  const { addNotification } = useNotifications();
  const deleteUnitMutation = useDeleteUnit({
    mutationConfig: {
      onSuccess: (res) => {
        addNotification({
          type: "success",
          title: res.message,
        });
      },
    },
  });

  return (
    <ConfirmationDialog
      icon="danger"
      title="Delete Unit"
      body="Are you sure you want to delete this Unit?"
      triggerButton={
        <Button variant="destructive">
          <Trash className="size-4" />
        </Button>
      }
      confirmButton={
        <Button
          isLoading={deleteUnitMutation.isPending}
          type="button"
          variant="destructive"
          onClick={() => deleteUnitMutation.mutate({ unitId })}
        >
          Delete Unit
        </Button>
      }
    />
  );
};
