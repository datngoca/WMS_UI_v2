import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";
import { Check, AlertCircle, Sparkles, Clock } from "lucide-react";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
      description: "Kiểu giao diện của Badge",
      table: {
        defaultValue: { summary: "default" },
      },
    },
    children: {
      control: "text",
      description: "Nội dung bên trong Badge",
    },
    className: {
      control: "text",
      description: "Class tùy chỉnh thêm (Tailwind CSS)",
    },
  },
  args: {
    children: "Badge",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 1. Kiểu mặc định (Default / Primary)
 */
export const Default: Story = {
  args: {
    variant: "default",
    children: "Default Badge",
  },
};

/**
 * 2. Kiểu phụ (Secondary)
 */
export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Badge",
  },
};

/**
 * 3. Kiểu cảnh báo / Thất bại (Destructive)
 */
export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Destructive Badge",
  },
};

/**
 * 4. Kiểu viền ngoài (Outline)
 */
export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline Badge",
  },
};

/**
 * 5. Tổng hợp tất cả các biến thể (Showcase)
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

/**
 * 6. Badge kết hợp cùng Icon (Lucide Icons)
 */
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="default" className="gap-1.5">
        <Sparkles className="size-3.5" />
        Tính năng mới
      </Badge>
      <Badge variant="secondary" className="gap-1.5">
        <Clock className="size-3.5" />
        Đang xử lý
      </Badge>
      <Badge variant="outline" className="gap-1.5">
        <Check className="size-3.5 text-emerald-500" />
        Hoàn tất
      </Badge>
      <Badge variant="destructive" className="gap-1.5">
        <AlertCircle className="size-3.5" />
        Thất bại
      </Badge>
    </div>
  ),
};
