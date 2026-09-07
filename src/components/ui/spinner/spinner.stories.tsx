import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "./spinner";

const meta: Meta<typeof Spinner> = {
    title: "UI/Spinner",
    component: Spinner,
    tags: ["autodocs"],
    argTypes: {
    // Thêm các props của component tại đây
        size: {
            options: ['sm', 'md', 'lg', 'xl'],
            control: { type: 'select' },
        }
    },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        size: 'md'
    },
};

export const Small: Story = {
    args: {
       size: 'sm'
    },
};

export const Large: Story = {
    args: {
        size: 'lg'
    },
};

export const ExtraLarge: Story = {
    args: {
        size: 'xl'
    },
};