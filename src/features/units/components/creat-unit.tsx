import { useNotifications } from "@/components/ui/notifications";
import { type CreateUnitInput, createUnitInputSchema, useCreateUnit } from "../api/create-unit";
import {
    Form,
    FormDrawer,
    Input,
    Textarea,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type CreateUnitProps = {
    parent?: { id: number; name: string };
};

export const CreateUnit = ({ parent }: CreateUnitProps) => {
    const { addNotification } = useNotifications();
    const createUnitMutation = useCreateUnit({
        mutationConfig: {
            onSuccess: (value) => {
                addNotification({
                    type: "success",
                    title: value.message,
                });
            },
        },
    });
    const onSubmit = (values: CreateUnitInput) => {
        createUnitMutation.mutate({ data: values });
    };
    return (
        <FormDrawer
            isDone={createUnitMutation.isSuccess}
            triggerButton={
                !parent ? (
                    <Button size="sm" icon={<Plus className="size-4" />}>
                        Create Unit
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
            title="Create Unit"
            submitButton={
                <Button
                    form="create-unit"
                    type="submit"
                    size="sm"
                    isLoading={createUnitMutation.isPending}
                >
                    Submit
                </Button>
            }
        >
            <Form
                id="create-unit"
                onSubmit={onSubmit}
                schema={createUnitInputSchema}
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