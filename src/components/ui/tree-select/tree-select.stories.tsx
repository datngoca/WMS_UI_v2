import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { TreeSelect } from "./tree-select";
import type { TreeNodeData } from "./types";

const mockWarehouseData: TreeNodeData[] = [
  {
    name: "Kho Tổng TP.HCM (WH-HCM)",
    value: "wh-hcm",
    children: [
      {
        name: "Khu vực A - Hàng điện tử",
        value: "area-a",
        children: [
          {
            name: "Dãy A1 - Smartphone",
            value: "row-a1",
            children: [
              { name: "Kệ A1-01 (iPhone)", value: "rack-a1-01" },
              { name: "Kệ A1-02 (Samsung)", value: "rack-a1-02" },
              { name: "Kệ A1-03 (Xiaomi)", value: "rack-a1-03" },
            ],
          },
          {
            name: "Dãy A2 - Laptop & Tablet",
            value: "row-a2",
            children: [
              { name: "Kệ A2-01 (MacBook)", value: "rack-a2-01" },
              { name: "Kệ A2-02 (Dell & ThinkPad)", value: "rack-a2-02" },
            ],
          },
        ],
      },
      {
        name: "Khu vực B - Phụ kiện & Linh kiện",
        value: "area-b",
        children: [
          { name: "Kệ B1 - Cáp & Củ sạc", value: "rack-b1" },
          { name: "Kệ B2 - Tai nghe & Loa", value: "rack-b2" },
          { name: "Kệ B3 - Ốp lưng & Bao da", value: "rack-b3" },
        ],
      },
    ],
  },
  {
    name: "Kho Phía Bắc Hà Nội (WH-HN)",
    value: "wh-hn",
    children: [
      {
        name: "Khu vực C - Gia dụng",
        value: "area-c",
        children: [
          { name: "Kệ C1 - Nồi chiên & Lò vi sóng", value: "rack-c1" },
          { name: "Kệ C2 - Máy lọc không khí", value: "rack-c2" },
        ],
      },
      {
        name: "Khu vực D - Hàng lưu kho dài hạn",
        value: "area-d",
        children: [
          { name: "Kệ D1 - Pallet hàng số lượng lớn", value: "rack-d1" },
        ],
      },
    ],
  },
];

const meta: Meta<typeof TreeSelect> = {
  title: "UI/TreeSelect",
  component: TreeSelect,
  tags: ["autodocs"],
  argTypes: {
    loading: {
      control: "boolean",
      description: "Trạng thái đang tải dữ liệu danh sách cây",
    },
    "aria-invalid": {
      control: "boolean",
      description: "Trạng thái hiển thị viền lỗi (validation error)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultTreeSelectDemo(args) {
    const [value, setValue] = React.useState<string[]>([]);

    return (
      <div className="flex flex-col gap-4 max-w-md">
        <div className="text-sm text-muted-foreground">
          Chọn vị trí lưu trữ hoặc danh mục theo dạng cây nhiều cấp:
        </div>
        <TreeSelect
          {...args}
          data={mockWarehouseData}
          value={value}
          onValueChange={setValue}
        />
        <div className="rounded-md border p-3 text-xs bg-muted/40">
          <div className="font-medium text-foreground mb-1">
            Đã chọn ({value.length} mục):
          </div>
          <code>{JSON.stringify(value, null, 2)}</code>
        </div>
      </div>
    );
  },
};

export const WithInitialValues: Story = {
  render: function InitialValuesDemo() {
    const [value, setValue] = React.useState<string[]>([
      "rack-a1-01",
      "rack-a1-02",
      "rack-b1",
    ]);

    return (
      <div className="flex flex-col gap-4 max-w-md">
        <div className="text-sm text-muted-foreground">
          Đã chọn sẵn một số kệ hàng:
        </div>
        <TreeSelect
          data={mockWarehouseData}
          value={value}
          onValueChange={setValue}
        />
      </div>
    );
  },
};

export const DeeplyNested: Story = {
  render: function DeepTreeDemo() {
    const [value, setValue] = React.useState<string[]>([]);

    return (
      <div className="flex flex-col gap-4 max-w-lg">
        <div className="text-sm text-muted-foreground">
          Dữ liệu phân cấp 4 tầng: Kho → Khu vực → Dãy → Kệ.
        </div>
        <TreeSelect
          data={mockWarehouseData}
          value={value}
          onValueChange={setValue}
        />
      </div>
    );
  },
};

export const Loading: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <TreeSelect
        data={mockWarehouseData}
        value={[]}
        onValueChange={() => {}}
        loading
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <TreeSelect data={[]} value={[]} onValueChange={() => {}} />
    </div>
  ),
};

export const InvalidState: Story = {
  render: function InvalidTreeSelectDemo() {
    const [value, setValue] = React.useState<string[]>([]);

    return (
      <div className="flex flex-col gap-2 max-w-md">
        <label className="text-sm font-medium text-destructive">
          Vị trí bắt buộc chọn *
        </label>
        <TreeSelect
          data={mockWarehouseData}
          value={value}
          onValueChange={setValue}
          aria-invalid={true}
        />
        <p className="text-xs text-destructive">
          Vui lòng chọn ít nhất một vị trí lưu kho.
        </p>
      </div>
    );
  },
};