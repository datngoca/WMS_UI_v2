import { useNotifications } from "@/components/ui/notifications";
import {
  type CreateCategoryInput,
  createCategoryInputSchema,
  useCreateCategory,
} from "../api/create-categrory";
import {
  Form,
  FormDrawer,
  Input,
  Textarea,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type CreateCategoryProps = {
  parent?: { id: number; name: string } | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: React.ReactElement | null;
};

export const CreateCategory = ({
  parent,
  open,
  onOpenChange,
  triggerButton,
}: CreateCategoryProps) => {
  const { addNotification } = useNotifications();
  const createCategoryMutation = useCreateCategory({
    mutationConfig: {
      onSuccess: (value) => {
        addNotification({
          type: "success",
          title: value.message,
        });
        onOpenChange?.(false);
      },
    },
  });
  const formId = parent ? `create-category-${parent.id}` : "create-category-root";

  const onSubmit = (values: CreateCategoryInput) => {
    const data = { ...values, parentId: parent?.id ?? null };
    console.log("Create category data:", data);
    createCategoryMutation.mutate({ data });
  };

  const defaultTriggerButton = !parent ? (
    <Button size="sm" icon={<Plus className="size-4" />}>
      Thêm danh mục
    </Button>
  ) : (
    <Button
      size="sm"
      variant="outline"
      className="hover:text-primary hover:bg-secondary"
    >
      <Plus className="size-3" />
    </Button>
  );

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      isDone={createCategoryMutation.isSuccess}
      triggerButton={triggerButton === null ? undefined : (triggerButton ?? defaultTriggerButton)}
      title={parent ? `Thêm danh mục con cho "${parent.name}"` : "Tạo danh mục mới"}
      submitButton={
        <Button
          form={formId}
          type="submit"
          size="sm"
          isLoading={createCategoryMutation.isPending}
        >
          Submit
        </Button>
      }
    >
      <Form
        id={formId}
        onSubmit={onSubmit}
        schema={createCategoryInputSchema}
      >
        {({ register, formState }) => (
          <>
            <Input
              label="Name"
              info="Enter name of Category"
              error={formState.errors["name"]}
              registration={register("name")}
              placeholder="Organic Tropical Fruits"
            />

            <Textarea
              label="Description"
              info="Optional summary of your category."
              error={formState.errors["description"]}
              registration={register("description")}
              placeholder="Tell us a little bit about category..."
            />
            {parent && (
              <Input
                value={parent.name}
                disabled
                label="Parent"
              />
            )}
          </>
        )}
      </Form>
    </FormDrawer>
  );
};
