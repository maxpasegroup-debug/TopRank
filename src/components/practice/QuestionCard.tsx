import { ProgressBar } from "../ui/ProgressBar";
import { OptionCard } from "./OptionCard";

type QuestionCardOption = {
  code: string;
  text: string;
};

export type QuestionCardData = {
  code: string;
  text: string;
  type: string;
  difficulty: string;
  subject: { name: string };
  chapter: { title: string };
  options: QuestionCardOption[];
};

export function QuestionCard({ question }: { question: QuestionCardData }) {
  return (
    <section className="question-card">
      <div className="question-topline">
        <span>{question.code}</span>
        <span>{question.difficulty}</span>
      </div>
      <ProgressBar value={45} />
      <div className="breadcrumb-strip">
        <span>{question.subject.name}</span>
        <span>{question.chapter.title}</span>
        <span>{question.type.split("_").join(" ")}</span>
      </div>
      <h1 className="question-title">{question.text}</h1>
      <div className="question-options">
        {question.options.map((option) => (
          <OptionCard label={option.code} text={option.text} key={option.code} />
        ))}
      </div>
    </section>
  );
}
