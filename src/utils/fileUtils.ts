export type FileInputTarget = "original" | "changed";

export interface FileHandlerResult {
  content: string;
  target: FileInputTarget;
}

export function triggerFileInput(
  setActiveFileInput: (target: FileInputTarget | null) => void,
  fileInputRef: React.RefObject<HTMLInputElement | null>,
  target: FileInputTarget,
) {
  setActiveFileInput(target);
  fileInputRef.current?.click();
}

export function handleFileSelect(
  event: React.ChangeEvent<HTMLInputElement>,
  activeFileInput: FileInputTarget | null,
  onFileLoaded: (content: string, target: FileInputTarget) => void,
  setActiveFileInput: (target: null) => void,
) {
  const file = event.target.files?.[0];
  if (file && activeFileInput) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoaded(content, activeFileInput);
    };
    reader.readAsText(file);
  }
  setActiveFileInput(null);
}
