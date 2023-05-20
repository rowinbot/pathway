import { writable, readable } from "svelte/store";
import { v4 as uuid } from "uuid";

const DEFAULT_TIMEOUT = 1250;

type NotificationType = "default" | "danger" | "warning" | "info" | "success";
interface Notification {
  type: NotificationType;
  message: string;
  id: string;
  timeout: number;
}

function createNotificationStore(defaultTimeout = DEFAULT_TIMEOUT) {
  const timers: ReturnType<typeof setTimeout>[] = [];
  const initialNotifications: Notification[] = [];

  const notifications = writable(initialNotifications, () => {
    return () => {
      while (timers.length) clearTimeout(timers.shift()!);
    };
  });

  function send(
    message: string,
    type: NotificationType = "default",
    timeout?: number
  ) {
    const notification = {
      id: uuid(),
      type,
      message,
      timeout: timeout ?? defaultTimeout,
    };

    notifications.update((state) => [...state, notification]);
    timers.push(setTimeout(removeNotification, notification.timeout));
  }

  function removeNotification() {
    notifications.update((state) => state.slice(1));
    timers.shift();
  }

  const readableNotifications = readable(initialNotifications, (set) => {
    const unsubscribe = notifications.subscribe(set);

    return unsubscribe;
  });

  return {
    subscribe: readableNotifications.subscribe, // Disable writing directly to the store
    send,
    default: (msg: string, timeout?: number) => send(msg, "default", timeout),
    danger: (msg: string, timeout?: number) => send(msg, "danger", timeout),
    warning: (msg: string, timeout?: number) => send(msg, "warning", timeout),
    info: (msg: string, timeout?: number) => send(msg, "info", timeout),
    success: (msg: string, timeout?: number) => send(msg, "success", timeout),
  };
}

export const notifications = createNotificationStore();
