import type { Meta, StoryObj } from "@storybook/react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Popover> = {
  title: "UI/Popover",
  component: Popover,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex h-[250px] items-center justify-center">
      <Popover {...args}>
        <PopoverTrigger asChild>
          <Button variant="outline">Mở Popover</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-2">
            <h4 className="font-medium leading-none">Thông tin sản phẩm</h4>
            <p className="text-sm text-muted-foreground">
              Xem nhanh chi tiết thuộc tính sản phẩm trong kho.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const MatchInputWidth: Story = {
  render: (args) => (
    <div className="flex h-[300px] w-full max-w-md flex-col justify-center gap-2 p-4">
      <label className="text-sm font-medium">Search & Select (Popover Width = Input Width)</label>
      <Popover {...args}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <span className="text-muted-foreground">Click to open dropdown list...</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-2 shadow-md"
          align="start"
        >
          <div className="space-y-1 text-sm">
            <div className="rounded px-2 py-1.5 hover:bg-accent cursor-pointer">Option 1 - Warehouse A</div>
            <div className="rounded px-2 py-1.5 hover:bg-accent cursor-pointer">Option 2 - Warehouse B</div>
            <div className="rounded px-2 py-1.5 hover:bg-accent cursor-pointer">Option 3 - Warehouse C</div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

