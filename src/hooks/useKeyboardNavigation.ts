import { useCallback, useEffect } from "react";

interface UseKeyboardNavigationProps {
  viewMode: "input" | "diff";
  canDiff: boolean;
  originalTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  changedTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  findDiffButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export function useKeyboardNavigation({
  viewMode,
  canDiff,
  originalTextareaRef,
  changedTextareaRef,
  findDiffButtonRef,
}: UseKeyboardNavigationProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (viewMode !== "input") return;

      const activeElement = document.activeElement as HTMLElement;
      if (!activeElement) return;

      const focusOrder: HTMLElement[] = [
        originalTextareaRef.current,
        changedTextareaRef.current,
        canDiff ? findDiffButtonRef.current : null,
      ].filter(Boolean) as HTMLElement[];

      const currentIndex = focusOrder.findIndex((el) => el === activeElement);
      if (currentIndex === -1) return;

      const direction = e.shiftKey ? -1 : 1;
      const nextIndex = (currentIndex + direction + focusOrder.length) % focusOrder.length;

      e.preventDefault();
      focusOrder[nextIndex]?.focus();
    },
    [viewMode, canDiff, originalTextareaRef, changedTextareaRef, findDiffButtonRef],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
