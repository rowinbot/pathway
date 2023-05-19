import { derived, writable } from "svelte/store";

class DraggableMetaDeserializationError extends Error {
  constructor() {
    super("Deserialized value is not a DraggableMeta.");
  }
}

interface DraggableMeta<T> {
  targetAreaId: string;
  value: T;
}

function serialize<T>(value: DraggableMeta<T>) {
  return JSON.stringify(value);
}

function deserialize<T>(value: string) {
  const object = JSON.parse(value);

  if (typeof object !== "object") {
    throw new DraggableMetaDeserializationError();
  }

  if (!("targetAreaId" in object)) {
    throw new DraggableMetaDeserializationError();
  }

  return object as DraggableMeta<T>;
}

export function createDraggable<T>(
  targetAreaId: string,
  value: T,
  onKeyboardDrop: (value: T) => void
) {
  const dragging = writable(false);
  const isDragging = derived(dragging, (v) => v);

  function onDragStart(event: DragEvent) {
    if (!event.dataTransfer) return;

    event.dataTransfer.setData(
      "text/plain",
      "" +
        serialize({
          targetAreaId,
          value,
        })
    );
    event.dataTransfer.effectAllowed = "copy";
    dragging.set(true);
  }

  function onDragEnd() {
    dragging.set(false);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      onKeyboardDrop(value);
    }
  }

  return {
    isDragging,
    onDragStart,
    onDragEnd,
    onKeyDown,
  };
}

export function createDroppable<V, T extends HTMLElement = HTMLDivElement>(
  onValidDrop: (value: V, target: T) => void,
  customCheckIfValid?: (value: V, target: T) => boolean
) {
  function onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    if (!event.dataTransfer) return;

    try {
      const meta = event.dataTransfer.getData("text/plain");
      const metaObj = deserialize<V>(meta);
      const target = (event.currentTarget || event.target) as T;

      if (customCheckIfValid) {
        const isValid = customCheckIfValid(metaObj.value, target);

        if (!isValid) {
          return;
        }
      } else if (!target || target.id !== metaObj.targetAreaId) {
        return;
      }

      onValidDrop(metaObj.value, target);
    } catch (e) {
      const isKnownError = e instanceof DraggableMetaDeserializationError;

      if (!isKnownError) {
        throw e;
      }
    }
  }

  return {
    onDragOver,
    onDrop,
  };
}
