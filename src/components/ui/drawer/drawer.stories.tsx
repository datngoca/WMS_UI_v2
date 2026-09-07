import type { Meta, StoryObj } from "@storybook/react";
import { Drawer } from "./drawer";

const meta: Meta<typeof Drawer> = {
    title: "UI/Drawer",
    component: Drawer,
    tags: ["autodocs"],
    argTypes: {
    // Thêm các props của component tại đây
    },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        // Truyền các props mặc định tại đây
    },
};