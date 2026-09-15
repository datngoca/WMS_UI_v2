import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { z } from "zod";

import { Button } from "../button";
import { Form } from "./form";
import { FormDrawer } from "./form-drawer";
import { Input } from "./input";
import { Select } from "./select";
import { Textarea } from "./textarea";
import { TreeSelect } from "./tree-select";

const formSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  role: z.string().min(1, "Please select a role"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

const meta: Meta<typeof Form> = {
  title: "UI/Form",
  component: Form,
  tags: ["autodocs"],
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

type Story = StoryObj<typeof Form<typeof formSchema, FormValues>>;

export const Default: Story = {
  render: () => {
    return (
      <div className="w-full max-w-md rounded-lg border p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">User Registration Form</h2>
        <Form<typeof formSchema, FormValues>
          onSubmit={fn()}
          schema={formSchema}
        >
          {({ register, formState }) => (
            <>
              <Input
                label="Full Name"
                info="Enter your legal full name as shown on official ID."
                error={formState.errors["title"]}
                registration={register("title")}
                placeholder="e.g. John Doe"
              />

              <Input
                type="email"
                label="Email"
                info="We will send account confirmation and notifications to this email."
                error={formState.errors["email"]}
                registration={register("email")}
                placeholder="john.doe@example.com"
              />

              <Select
                label="Role"
                info="Determines system access permissions and privileges."
                error={formState.errors["role"]}
                registration={register("role")}
                options={[
                  { label: "Select role...", value: "" },
                  { label: "Administrator", value: "ADMIN" },
                  { label: "Manager", value: "MANAGER" },
                  { label: "User", value: "USER" },
                ]}
              />

              <Textarea
                label="Bio / Notes"
                info="Optional summary of your background and responsibilities."
                error={formState.errors["description"]}
                registration={register("description")}
                placeholder="Tell us a little bit about yourself..."
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit">Submit Form</Button>
              </div>
            </>
          )}
        </Form>
      </div>
    );
  },
};

export const WithInitialValues: Story = {
  render: () => {
    return (
      <div className="w-full max-w-md rounded-lg border p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Edit Profile</h2>
        <Form<typeof formSchema, FormValues>
          onSubmit={fn()}
          schema={formSchema}
          options={{
            defaultValues: {
              title: "Jane Smith",
              email: "jane.smith@example.com",
              role: "MANAGER",
              description: "Senior Logistics Coordinator with 5+ years experience.",
            },
          }}
        >
          {({ register, formState }) => (
            <>
              <Input
                label="Full Name"
                error={formState.errors["title"]}
                registration={register("title")}
              />

              <Input
                type="email"
                label="Email"
                error={formState.errors["email"]}
                registration={register("email")}
              />

              <Select
                label="Role"
                defaultValue="MANAGER"
                error={formState.errors["role"]}
                registration={register("role")}
                options={[
                  { label: "Administrator", value: "ADMIN" },
                  { label: "Manager", value: "MANAGER" },
                  { label: "User", value: "USER" },
                ]}
              />

              <Textarea
                label="Bio / Notes"
                error={formState.errors["description"]}
                registration={register("description")}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline">
                  Reset
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </>
          )}
        </Form>
      </div>
    );
  },
};

export const InFormDrawer: Story = {
  render: () => {
    return (
      <FormDrawer
        title="Create New User"
        isDone={false}
        triggerButton={<Button>Open Create Form</Button>}
        submitButton={
          <Button type="submit" form="drawer-form">
            Save User
          </Button>
        }
      >
        <Form<typeof formSchema, FormValues>
          id="drawer-form"
          onSubmit={fn()}
          schema={formSchema}
        >
          {({ register, formState }) => (
            <div className="space-y-4 p-4">
              <Input
                label="Name"
                error={formState.errors["title"]}
                registration={register("title")}
                placeholder="Enter name"
              />

              <Input
                type="email"
                label="Email"
                error={formState.errors["email"]}
                registration={register("email")}
                placeholder="Enter email"
              />

              <Select
                label="Role"
                error={formState.errors["role"]}
                registration={register("role")}
                options={[
                  { label: "Select role...", value: "" },
                  { label: "Administrator", value: "ADMIN" },
                  { label: "User", value: "USER" },
                ]}
              />

              <Textarea
                label="Description"
                error={formState.errors["description"]}
                registration={register("description")}
                placeholder="Enter description"
              />
            </div>
          )}
        </Form>
      </FormDrawer>
    );
  },
};

const treeData = [
  {
    name: "Electronics",
    value: "electronics",
    children: [
      {
        name: "Phones",
        value: "phones",
        children: [
          { name: "Smartphones", value: "smartphones" },
          { name: "Accessories", value: "accessories" },
        ],
      },
      {
        name: "Laptops",
        value: "laptops",
      },
    ],
  },
  {
    name: "Clothing",
    value: "clothing",
    children: [
      { name: "Men", value: "men" },
      { name: "Women", value: "women" },
    ],
  },
];

const treeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Please select a category"),
});

type TreeFormValues = z.infer<typeof treeFormSchema>;

export const WithTreeSelectField: StoryObj<typeof Form<typeof treeFormSchema, TreeFormValues>> = {
  render: () => {
    return (
      <div className="w-full max-w-md rounded-lg border p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Tree Select Form Field</h2>
        <Form<typeof treeFormSchema, TreeFormValues>
          onSubmit={fn()}
          schema={treeFormSchema}
        >
          {({ register, formState }) => (
            <>
              <Input
                label="Product Name"
                error={formState.errors["name"]}
                registration={register("name")}
                placeholder="e.g. iPhone 16 Pro"
              />

              <TreeSelect
                label="Category Tree"
                info="Select the category hierarchy this item belongs to."
                error={formState.errors["category"]}
                registration={register("category")}
                data={treeData}
                placeholder="Choose category..."
              />

              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </div>
            </>
          )}
        </Form>
      </div>
    );
  },
};
