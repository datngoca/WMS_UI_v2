import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Checkbox } from "./checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: "boolean",
      description: "Trạng thái checked của checkbox",
    },
    disabled: {
      control: "boolean",
      description: "Vô hiệu hóa checkbox",
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: "terms",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms1" />
      <label
        htmlFor="terms1"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Chấp nhận điều khoản và điều kiện
      </label>
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="items-top flex space-x-2">
      <Checkbox id="terms2" />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor="terms2"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Nhận thông báo qua email
        </label>
        <p className="text-xs text-muted-foreground">
          Bạn sẽ nhận được các thông báo cập nhật về đơn hàng và kho bãi.
        </p>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-unchecked" disabled />
        <label
          htmlFor="disabled-unchecked"
          className="text-sm font-medium leading-none text-muted-foreground"
        >
          Disabled chưa chọn
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-checked" disabled defaultChecked />
        <label
          htmlFor="disabled-checked"
          className="text-sm font-medium leading-none text-muted-foreground"
        >
          Disabled đã chọn
        </label>
      </div>
    </div>
  ),
};

export const Controlled: Story = {
  render: function ControlledDemo() {
    const [checked, setChecked] = React.useState<boolean | "indeterminate">(true);

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="controlled"
            checked={checked}
            onCheckedChange={setChecked}
          />
          <label htmlFor="controlled" className="text-sm font-medium leading-none cursor-pointer">
            Trạng thái hiện tại: <strong>{checked ? "Checked" : "Unchecked"}</strong>
          </label>
        </div>
      </div>
    );
  },
};