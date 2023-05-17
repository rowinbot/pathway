import { writable, derived } from "svelte/store";
import { v4 as uuid } from "uuid";

const TIMEOUT = 1250;

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

  const timersWritable = writable(
    {} as Record<string, ReturnType<typeof setTimeout>>
  );

  function addTimer(
    id: string,
    timeout: number,
    timers: Record<string, ReturnType<typeof setTimeout>>
  ) {
    timers[id] = setTimeout(() => {
      _notifications.update((state) => {
        state.shift();
        timersWritable.update((t) => {
          delete t[id];

          return t;
        });

        return state;
      });
    }, timeout);
  }

  const notifications = derived(_notifications, ($_notifications, set) => {
    set($_notifications);

    if ($_notifications.length > 0) {
      timersWritable.update((timers) => {
        for (const notification of $_notifications) {
          if (!(notification.id in timers)) {
            addTimer(notification.id, notification.timeout, timers);
          }
        }

        return timers;
      });
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
