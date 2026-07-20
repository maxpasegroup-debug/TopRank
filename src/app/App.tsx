import { AppShell } from "../components/layout/AppShell";
import { PresenterPanel } from "../components/demo/PresenterPanel";
import { ProductTour } from "../components/demo/ProductTour";
import { ToastStack } from "../components/polish/Toast";
import { getRoute } from "./routes";
import { AuthPage } from "../pages/AuthPages";
import { DemoMissionControl } from "../pages/DemoMissionControl";
import { DemoStart } from "../pages/DemoStart";
import { Home } from "../pages/Home";
import { Landing } from "../pages/Landing";
import { Learn } from "../pages/Learn";
import { Downloads } from "../pages/learning/Downloads";
import { LearnSearch } from "../pages/learning/LearnSearch";
import { LessonExperience } from "../pages/learning/LessonExperience";
import { Revision } from "../pages/learning/Revision";
import { SubjectWorkspace } from "../pages/learning/SubjectWorkspace";
import { Me } from "../pages/Me";
import { MissionFlow, MissionReady, WelcomeJourney } from "../pages/MissionFlow";
import { Onboarding } from "../pages/Onboarding";
import { ParentPreview } from "../pages/ParentPreview";
import { PresentationSummary } from "../pages/PresentationSummary";
import { Practice } from "../pages/Practice";
import { ChapterPractice } from "../pages/practice/ChapterPractice";
import { MockTests } from "../pages/practice/MockTests";
import { PracticeComplete } from "../pages/practice/PracticeComplete";
import { PracticeReview } from "../pages/practice/PracticeReview";
import { PreviousYearPapers } from "../pages/practice/PreviousYearPapers";
import { QuestionExperience } from "../pages/practice/QuestionExperience";
import { Progress } from "../pages/Progress";
import { Settings } from "../pages/Settings";
import { SchoolPreview } from "../pages/SchoolPreview";
import { Tara } from "../pages/Tara";
import { SuccessState } from "../pages/SuccessState";
import { TaraChat } from "../pages/tara/TaraChat";
import { TaraMood } from "../pages/tara/TaraMood";
import { TaraReflection } from "../pages/tara/TaraReflection";

function renderScreen(screen: ReturnType<typeof getRoute>["screen"]) {
  switch (screen) {
    case "login":
      return <AuthPage mode="login" />;
    case "signup":
      return <AuthPage mode="signup" />;
    case "onboarding":
      return <Onboarding />;
    case "welcome":
      return <WelcomeJourney />;
    case "missionExam":
    case "missionYear":
    case "missionCollege":
    case "missionHours":
      return <MissionFlow screen={screen} />;
    case "missionReady":
      return <MissionReady />;
    case "demoStart":
      return <DemoStart />;
    case "demo":
      return <DemoMissionControl />;
    case "presentationSummary":
      return <PresentationSummary />;
    case "successLesson":
      return <SuccessState type="lesson" />;
    case "successPractice":
      return <SuccessState type="practice" />;
    case "successWeek":
      return <SuccessState type="week" />;
    case "successStreak":
      return <SuccessState type="streak" />;
    case "successMock":
      return <SuccessState type="mock" />;
    case "successMilestone":
      return <SuccessState type="milestone" />;
    case "home":
      return <Home />;
    case "learn":
      return <Learn />;
    case "learnPhysics":
      return <SubjectWorkspace subject="Physics" />;
    case "learnChemistry":
      return <SubjectWorkspace subject="Chemistry" />;
    case "learnBiology":
      return <SubjectWorkspace subject="Biology" />;
    case "lessonMotion":
      return <LessonExperience />;
    case "learnRevision":
      return <Revision />;
    case "learnDownloads":
      return <Downloads />;
    case "learnSearch":
      return <LearnSearch />;
    case "practice":
      return <Practice />;
    case "practicePhysics":
      return <ChapterPractice />;
    case "practiceQuestion":
      return <QuestionExperience />;
    case "practiceComplete":
      return <PracticeComplete />;
    case "practiceReview":
      return <PracticeReview />;
    case "practiceMockTests":
      return <MockTests />;
    case "practicePapers":
      return <PreviousYearPapers />;
    case "progress":
      return <Progress />;
    case "tara":
      return <Tara />;
    case "taraChatStudy":
      return <TaraChat chat="study" />;
    case "taraChatMotivate":
      return <TaraChat chat="motivate" />;
    case "taraChatPlan":
      return <TaraChat chat="plan" />;
    case "taraChatRevise":
      return <TaraChat chat="revise" />;
    case "taraChatConcept":
      return <TaraChat chat="concept" />;
    case "taraChatAsk":
      return <TaraChat chat="ask" />;
    case "taraMoodGreat":
      return <TaraMood mood="great" />;
    case "taraMoodOkay":
      return <TaraMood mood="okay" />;
    case "taraMoodStressed":
      return <TaraMood mood="stressed" />;
    case "taraMoodTired":
      return <TaraMood mood="tired" />;
    case "taraReflection":
      return <TaraReflection />;
    case "me":
      return <Me />;
    case "parentPreview":
      return <ParentPreview />;
    case "schoolPreview":
      return <SchoolPreview />;
    case "settings":
      return <Settings />;
    case "landing":
    default:
      return <Landing />;
  }
}

export function App() {
  const route = getRoute(window.location.pathname);
  const screen = renderScreen(route.screen);
  const isDemoMode = window.location.pathname.startsWith("/demo") || window.location.search.includes("demo=1");
  const showTour = isDemoMode && !window.location.search.includes("tour=hide");

  if (!route.isAppRoute) {
    return <div className="app-shell">{screen}</div>;
  }

  return (
    <>
      <AppShell currentPath={route.path}>{screen}</AppShell>
      {showTour ? <ProductTour currentPath={route.path} /> : null}
      {isDemoMode ? <PresenterPanel currentPath={route.path} /> : null}
      <ToastStack />
    </>
  );
}
