import { ExamEngineHub } from "../components/prototype/ExamEngineHub";
import { PageContainer } from "../components/ui/PageContainer";
import type { StudentMissionDto, StudentProfileDto } from "../server/student/service";

type HomeProps = {
  profile?: StudentProfileDto;
  mission?: StudentMissionDto | null;
};

export function Home({ profile, mission }: HomeProps) {
  return (
    <PageContainer>
      <ExamEngineHub
        studentName={profile?.name}
        exam={profile?.targetExam?.name}
        targetYear={profile?.targetYear}
        dreamCollege={profile?.dreamCollege}
        dailyStudyHours={profile?.dailyStudyHours}
        mission={mission}
      />
    </PageContainer>
  );
}
