import { ChatInput } from "../components/tara/ChatInput";
import { ConversationCard } from "../components/tara/ConversationCard";
import { GlobalSearchLauncher } from "../components/polish/GlobalSearchLauncher";
import { MoodCard } from "../components/tara/MoodCard";
import { PlannerCard } from "../components/tara/PlannerCard";
import { QuickActionCard } from "../components/tara/QuickActionCard";
import { TaraHero } from "../components/tara/TaraHero";
import { TaraMotivationCard } from "../components/tara/TaraMotivationCard";
import { Button } from "../components/ui/Button";
import { PageContainer } from "../components/ui/PageContainer";
import { SectionHeader } from "../components/ui/SectionHeader";
import { historyItems, moods, quickActions } from "../data/tara";

export function Tara() {
  return (
    <PageContainer>
      <div className="screen-stack">
        <TaraHero />
        <GlobalSearchLauncher />

        <SectionHeader eyebrow="Quick Actions" title="What do you need right now?" />
        <div className="grid grid-3">
          {quickActions.map((action) => (
            <QuickActionCard action={action} key={action.title} />
          ))}
        </div>

        <SectionHeader eyebrow="Daily Check-in" title="How are you feeling today?" />
        <div className="grid grid-2">
          {moods.map((mood) => (
            <MoodCard mood={mood} key={mood.label} />
          ))}
        </div>

        <div className="grid grid-2">
          <TaraMotivationCard />
          <PlannerCard />
        </div>

        <SectionHeader
          eyebrow="Ask Tara"
          title="Future AI preview"
          subtitle="Typing is allowed, but the response is scripted in Level 1."
          action={<Button href="/tara/reflection" variant="secondary">Daily Reflection</Button>}
        />
        <ChatInput />

        <SectionHeader eyebrow="Conversation History" title="Recent mentor moments" />
        <div className="grid grid-2">
          {historyItems.map((conversation) => (
            <ConversationCard conversation={conversation} key={conversation.title} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
