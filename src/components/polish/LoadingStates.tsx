import { Card } from "../ui/Card";

function Lines({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div className={index === count - 1 ? "skeleton-line short" : "skeleton-line"} key={index} />
      ))}
    </>
  );
}

export function PageLoading() {
  return (
    <div className="loading-state page-loading" aria-label="Page loading preview">
      <Lines count={5} />
    </div>
  );
}

export function CardLoading() {
  return (
    <Card>
      <div className="loading-state">
        <Lines />
      </div>
    </Card>
  );
}

export function LessonLoading() {
  return (
    <div className="loading-state lesson-loading" aria-label="Lesson loading preview">
      <div className="skeleton-video" />
      <Lines />
    </div>
  );
}

export function PracticeLoading() {
  return (
    <div className="loading-state practice-loading" aria-label="Practice loading preview">
      <Lines count={6} />
    </div>
  );
}

export function ProfileLoading() {
  return (
    <div className="loading-state profile-loading" aria-label="Profile loading preview">
      <div className="skeleton-avatar" />
      <Lines />
    </div>
  );
}
