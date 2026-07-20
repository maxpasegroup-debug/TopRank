type OptionCardProps = {
  label: string;
  text: string;
};

export function OptionCard({ label, text }: OptionCardProps) {
  return (
    <button className="exam-option" type="button">
      <span>{label}</span>
      {text}
    </button>
  );
}
