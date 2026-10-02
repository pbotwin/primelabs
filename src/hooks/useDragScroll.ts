import { useEffect, type RefObject } from "react";

const DRAG_THRESHOLD = 6;

/* Lets mouse users grab a horizontal scroller and drag it, the way touch
   users swipe. A drag never triggers the click of the card under it. */
export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let pointerId: number | null = null;
    let startX = 0;
    let startScroll = 0;
    let dragged = false;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      if (element.scrollWidth <= element.clientWidth) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = element.scrollLeft;
      dragged = false;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      const distance = event.clientX - startX;
      if (!dragged && Math.abs(distance) > DRAG_THRESHOLD) {
        dragged = true;
        element.setPointerCapture(event.pointerId);
        element.classList.add("is-dragging");
      }
      if (dragged) element.scrollLeft = startScroll - distance;
    };
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      element.classList.remove("is-dragging");
    };
    const onClick = (event: MouseEvent) => {
      if (!dragged) return;
      dragged = false;
      event.preventDefault();
      event.stopPropagation();
    };

    element.addEventListener("pointerdown", onPointerDown);
    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerup", onPointerUp);
    element.addEventListener("pointercancel", onPointerUp);
    element.addEventListener("click", onClick, true);
    return () => {
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerup", onPointerUp);
      element.removeEventListener("pointercancel", onPointerUp);
      element.removeEventListener("click", onClick, true);
    };
  }, [ref]);
}
