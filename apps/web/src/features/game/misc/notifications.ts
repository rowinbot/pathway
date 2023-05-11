import { writable, derived } from "svelte/store";
import { v4 as uuid } from "uuid";

const TIMEOUT = 1500;

type NotificationType = "default" | "danger" | "warning" | "info" | "success";
interface Notification {
  type: NotificationType;
  message: string;
  id: string;
  timeout: number;
}
function createNotificationStore(defaultTimeout = TIMEOUT) {
  const _notifications = writable([] as Notification[]);

  function send(
    message: string,
    type: NotificationType = "default",
    timeout?: number
  ) {
    _notifications.update((state) => {
      return [
        ...state,
        { id: uuid(), type, message, timeout: timeout ?? defaultTimeout },
      ];
    });
  }

  let timers = [];

  const notifications = derived(_notifications, ($_notifications, set) => {
    set($_notifications);

    if ($_notifications.length > 0) {
      const timer = setTimeout(() => {
        _notifications.update((state) => {
          state.shift();
          return state;
        });
      }, $_notifications[0].timeout);

      return () => {
        clearTimeout(timer);
      };
    }
  });
  const { subscribe } = notifications;

  return {
    subscribe,
    send,
    default: (msg: string, timeout?: number) => send(msg, "default", timeout),
    danger: (msg: string, timeout?: number) => send(msg, "danger", timeout),
    warning: (msg: string, timeout?: number) => send(msg, "warning", timeout),
    info: (msg: string, timeout?: number) => send(msg, "info", timeout),
    success: (msg: string, timeout?: number) => send(msg, "success", timeout),
  };
}

export const notifications = createNotificationStore();
