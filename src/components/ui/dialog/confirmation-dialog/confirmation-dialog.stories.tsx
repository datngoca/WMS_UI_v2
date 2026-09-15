
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../../button";
import { ConfirmationDialog } from "./confirmation-dialog";

const meta: Meta<typeof ConfirmationDialog> = {
  title: "UI/ConfirmationDialog",
  component: ConfirmationDialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    title: { control: "text" },
    body: { control: "text" },
    cancelButtonText: { control: "text" },
    icon: {
      options: ["danger", "info"],
      control: { type: "radio" },
    },
    isDone: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Danger: Story = {
  render: () => (
    <ConfirmationDialog
      icon="danger"
      title="Xóa mục này?"
      body="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa mục này không?"
      triggerButton={<Button variant="destructive">Xóa</Button>}
      confirmButton={
        <Button variant="destructive" onClick={() => alert("Đã xóa!")}>
          Xác nhận xóa
        </Button>
      }
    />
  ),
};

export const Info: Story = {
  render: () => (
    <ConfirmationDialog
      icon="info"
      title="Xác nhận hành động"
      body="Bạn có muốn tiếp tục thực hiện hành động này không?"
      cancelButtonText="Không, để sau"
      triggerButton={<Button variant="default">Tiếp tục</Button>}
      confirmButton={
        <Button onClick={() => alert("Đã xác nhận!")}>Có, tiếp tục</Button>
      }
    />
  ),
};

export const WithoutBody: Story = {
  render: () => (
    <ConfirmationDialog
      icon="danger"
      title="Bạn có chắc không?"
      triggerButton={<Button variant="outline">Thực hiện</Button>}
      confirmButton={
        <Button variant="destructive" onClick={() => alert("Đã thực hiện!")}>
          Xác nhận
        </Button>
      }
    />
  ),
};

export const AutoClose: Story = {
  render: () => {
    const [isDone, setIsDone] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = () => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsDone(true);
        setTimeout(() => setIsDone(false), 100);
      }, 1500);
    };

    return (
      <ConfirmationDialog
        icon="info"
        title="Lưu thay đổi?"
        body="Dialog sẽ tự đóng sau khi xác nhận (giả lập gọi API 1.5s)."
        isDone={isDone}
        triggerButton={<Button>Lưu</Button>}
        confirmButton={
          <Button isLoading={isLoading} onClick={handleConfirm}>
            Lưu thay đổi
          </Button>
        }
      />
    );
  },
};
