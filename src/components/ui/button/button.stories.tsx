import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
    title: "UI/Button",
    component: Button,
    tags: ["autodocs"],
    argTypes: {
        // Thêm các props của component tại đây
        variant: {
            options: ["default", "outline", "secondary", "ghost", "link", "destructive"],
            control: { type: "select" },
        },
        size: {
            options: ["default", "sm", "lg", "icon"],
            control: { type: "select" },
        },
        icon: {
            control: { type: "text" },
        },
        isLoading: {
            control: { type: "boolean" },
        },
        disabled: {
            control: { type: "boolean" },
        },
        asChild: {
            control: { type: "boolean" },
        },
        className: {
            control: { type: "text" },
        },
        children: {
            control: { type: "text" },
        },
    },
    args: {
        onClick: fn(),
    }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        // Truyền các props mặc định tại đây
        variant: "default",
        size: "default",
        icon: null,
        isLoading: false,
        disabled: false,
        asChild: false,
        className: "",
        children: "Button",
    },
};