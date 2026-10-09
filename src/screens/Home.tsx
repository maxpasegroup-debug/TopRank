import { MissionBoard } from "../components/journey/MissionBoard";
import { PageContainer } from "../components/ui/PageContainer";
import type { StudentMissionDto, StudentProfileDto } from "../server/student/service";

type HomeProps = {
  profile?: StudentProfileDto;
  mission?: StudentMissionDto | null;
};

export function Home({ profile }: HomeProps) {
  return (
    <PageContainer>
      <MissionBoard name={profile?.name} />
    </PageContainer>
  );
}
