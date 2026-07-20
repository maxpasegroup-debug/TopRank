import { questionOptions } from "../../data/practice";
import { ProgressBar } from "../ui/ProgressBar";
import { OptionCard } from "./OptionCard";

export function QuestionCard() {
  return (
    <section className="question-card">
      <div className="question-topline">
        <span>Question 18</span>
        <span>24:18</span>
      </div>
      <ProgressBar value={45} />
      <h1 className="question-title">
        Which statement best describes displacement in straight line motion?
      </h1>
      <div className="question-options">
        {questionOptions.map((option, index) => (
          <OptionCard label={String.fromCharCode(65 + index)} text={option} key={option} />
        ))}
      </div>
    </section>
  );
}
