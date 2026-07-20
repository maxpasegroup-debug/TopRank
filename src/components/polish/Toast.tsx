type ToastProps = {
  title: string;
  text: string;
};

export function Toast({ title, text }: ToastProps) {
  return (
    <div className="toast">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

export function ToastStack() {
  return (
    <div className="toast-stack" aria-label="Prototype notifications">
      <Toast title="Bookmark Added" text="Mock save ready for demo." />
      <Toast title="Reminder Set" text="Today's mission stays visible." />
    </div>
  );
}
