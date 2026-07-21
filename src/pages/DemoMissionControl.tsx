import { ExamEngineHub } from "../components/prototype/ExamEngineHub";
import { demoStudent } from "../data/demo";
import { PageContainer } from "../components/ui/PageContainer";

export function DemoMissionControl() {
  return (
    <PageContainer>
      <ExamEngineHub
        demo
        studentName={demoStudent.name}
        exam={demoStudent.exam}
        targetYear={demoStudent.targetYear}
      />
    </PageContainer>
  );
}
