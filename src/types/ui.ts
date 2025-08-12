export interface IModalView {
  setContent(node: HTMLElement): void;
  open(): void;
  close(): void;
  isOpen(): boolean;
}
