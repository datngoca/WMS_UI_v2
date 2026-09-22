import { Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/components/ui/notifications";
import { useUnit } from "../api/get-unit";
import { updateUnitInputSchema, useUpdateUnit } from "../api/update-unit";
import { Form, FormDrawer, Input, Textarea } from "@/components/ui/form";

type UpdateUnitProps = {
  unitId: number;
};

export const UpdateUnit = ({ unitId }: UpdateUnitProps) => {
  const { addNotification } = useNotifications();
  const unitQuery = useUnit({ unitId });
  const updateUnitMutation = useUpdateUnit({
    mutationConfig: {
      onSuccess: (value) => {
        addNotification({
          type: "success",
          title: value.message,
        });
      },
    },
  });
  const unit = unitQuery.data?.data;
  return (
    <FormDrawer
      isDone={unitQuery.isSuccess}
      triggerButton={
        <Button size="sm" variant="outline">
          <Pen className="size-4" />
        </Button>
      }
      title={`Update Unit ${unit?.name}`}
      submitButton={
        <Button
          type="submit"
          form="update-unit"
          size="sm"
          isLoading={updateUnitMutation.isPending}
        >
          Submit
        </Button>
      }
    >
      <Form
        onSubmit={(values) => {
          updateUnitMutation.mutate({
            data: {
              name: values.name || "",
              code: values.code || "",
              description: values.description || null,
            },
            unitId,
          });
        }}
        schema={updateUnitInputSchema}
        options={{
          defaultValues: {
            name: unit?.name,
            code: unit?.code,
            description: unit?.description,
          },
        }}
      >
        {({ register, formState }) => (
          <>
            <Input
              label="Name"
              info="Enter name of Unit"
              error={formState.errors["name"]}
              registration={register("name")}
              placeholder="KG"
            />
            <Input
              label="Code"
              info="Enter code of Unit"
              error={formState.errors["code"]}
              registration={register("code")}
              placeholder="KG"
            />
            <Textarea
              label="Description"
              info="Optional summary of your background and responsibilities."
              error={formState.errors["description"]}
              registration={register("description")}
              placeholder="Tell us a little bit about unit..."
            />
          </>
        )}
      </Form>
    </FormDrawer>
  );
};
