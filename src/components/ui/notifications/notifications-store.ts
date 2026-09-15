import { nanoid } from "nanoid";
import { create } from "zustand";

export type Notification = {
    id: string;
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message?: string;
}

type NotificationsStore = {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    dismissNotification: (id: string) => void;
};

export const useNotifications = create<NotificationsStore>((set) => ({
    notifications: [],
    addNotification: (notification) =>
        set((state) => {
            const next = [...state.notifications, { id: nanoid(), ...notification }];
            // Giới hạn tối đa 5 notifications để tránh tích lũy vô tận
            return { notifications: next.slice(-5) };
        }),
    dismissNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((notification) => notification.id != id),
        })),
}));