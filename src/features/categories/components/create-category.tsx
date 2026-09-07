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
  Select,
  Textarea,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type CreateCategoryProps = {
  parent?: { id: number; name: string };
};

export const CreateCategory = ({ parent }: CreateCategoryProps) => {
  const { addNotification } = useNotifications();
  const createCategoryMutation = useCreateCategory({
    mutationConfig: {
      onSuccess: (value) => {
        addNotification({
          type: "success",
          title: value.message,
        });
      },
    },
  });
  const onSubmit = (values: CreateCategoryInput) => {
    const data = { ...values, parentId: parent.id ?? null };
    console.log(data);
    createCategoryMutation.mutate({ data });
  };
  return (
    <FormDrawer
      isDone={createCategoryMutation.isSuccess}
      triggerButton={
        !parent ? (
          <Button size="sm" icon={<Plus className="size-4" />}>
            Create Discussion
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="hover:text-primary hover:bg-secondary"
          >
            <Plus className="size-3" />
          </Button>
        )
      }
      title="Create Discussion"
      submitButton={
        <Button
          form="create-discussion"
          type="submit"
          size="sm"
          isLoading={createCategoryMutation.isPending}
        >
          Submit
        </Button>
      }
    >
      <Form
        id="create-discussion"
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
              info="Optional summary of your background and responsibilities."
              error={formState.errors["description"]}
              registration={register("description")}
              placeholder="Tell us a little bit about category..."
            />
            {parent && (
              <Input
                value={parent.name}
                disabled
                label="Parent"
                registration={register("parentId")}
              />
            )}
          </>
        )}
      </Form>
    </FormDrawer>
  );
};
