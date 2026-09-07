import type { Meta, StoryObj } from "@storybook/react";
import { Notification } from "./notification";

const meta: Meta<typeof Notification> = {
    title: "UI/Notification",
    component: Notification,
    tags: ["autodocs"],
    parameters: {
        controls: { expanded: true },
    }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Info: Story = {
    args: {
        notification: {
            id: "1",
            type: "info",
            title: "Notification",
            message: "This is a notification",
        },
        onDismiss: (id: string) => alert(`Dismissing Notification with id: ${id}`),
    },
};

export const Success: Story = {
    args: {
        notification: {
            id: "2",
            type: "success",
            title: "Success",
            message: "This is a success notification",
        },
        onDismiss: (id: string) => alert(`Dismissing Notification with id: ${id}`),
    }
}

export const Warning: Story = {
    args: {
        notification: {
            id: "3",
            type: "warning",
            title: "Warning",
            message: "This is a warning notification",
        },
        onDismiss: (id: string) => alert(`Dismissing Notification with id: ${id}`),
    }
}

export const Error: Story = {
    args: {
        notification: {
            id: "4",
            type: "error",
            title: "Error",
            message: "This is an error notification",
        },
        onDismiss: (id: string) => alert(`Dismissing Notification with id: ${id}`),
    }
}