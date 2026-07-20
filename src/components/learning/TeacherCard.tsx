import { Card } from "../ui/Card";

export function TeacherCard() {
  return (
    <Card>
      <div className="teacher-card">
        <div className="student-avatar">SK</div>
        <div>
          <h3 className="learning-card-title">Teacher: S. Kumar</h3>
          <p className="card-copy">Physics mentor. Clear concepts, simple examples.</p>
        </div>
      </div>
    </Card>
  );
}
