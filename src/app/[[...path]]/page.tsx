import { AppShell } from "@/components/layout/AppShell";
import { ToastStack } from "@/components/polish/Toast";
import { ProductTour } from "@/components/demo/ProductTour";
import { PresenterPanel } from "@/components/demo/PresenterPanel";
import { getRoute } from "../routes";
import { AuthPage } from "@/screens/AuthPages";
import { DemoMissionControl } from "@/screens/DemoMissionControl";
import { DemoStart } from "@/screens/DemoStart";
import { Home } from "@/screens/Home";
import { Landing } from "@/screens/Landing";
import { Learn } from "@/screens/Learn";
import { Downloads } from "@/screens/learning/Downloads";
import { LearnSearch } from "@/screens/learning/LearnSearch";
import { LessonExperience } from "@/screens/learning/LessonExperience";
import { ChapterLessons } from "@/screens/learning/ChapterLessons";
import { Revision } from "@/screens/learning/Revision";
import { SubjectWorkspace } from "@/screens/learning/SubjectWorkspace";
import { Me } from "@/screens/Me";
import { MissionFlow, MissionReady, WelcomeJourney } from "@/screens/MissionFlow";
import { Onboarding } from "@/screens/Onboarding";
import { ParentPreview } from "@/screens/ParentPreview";
import { PresentationSummary } from "@/screens/PresentationSummary";
import { Practice } from "@/screens/Practice";
import { ChapterPractice } from "@/screens/practice/ChapterPractice";
import { MockTests } from "@/screens/practice/MockTests";
import { PracticeComplete } from "@/screens/practice/PracticeComplete";
import { PracticeReview } from "@/screens/practice/PracticeReview";
import { PreviousYearPapers } from "@/screens/practice/PreviousYearPapers";
import { QuestionExperience } from "@/screens/practice/QuestionExperience";
import { Progress } from "@/screens/Progress";
import { Settings } from "@/screens/Settings";
import { SchoolPreview } from "@/screens/SchoolPreview";
import { Tara } from "@/screens/Tara";
import { SuccessState } from "@/screens/SuccessState";
import { TaraChat } from "@/screens/tara/TaraChat";
import { TaraMood } from "@/screens/tara/TaraMood";
import { TaraReflection } from "@/screens/tara/TaraReflection";
import { requireAuth, requireRole } from "@/server/auth/session";
import { parentRoles, schoolRoles } from "@/server/auth/roles";
import { redirect } from "next/navigation";
import { getMissionControl, getOnboardingStatus, getStudentProfile, listSupportedExams } from "@/server/student/service";
import { getLessonDetail, getStudentLearningHome, listChaptersForSubject, listLessonsForChapter } from "@/server/content/service";
import { getQuestion, getStudentPracticeHome, listQuestions, listQuestionsForChapter, listQuestionsForSubject } from "@/server/question/service";
import type { ScreenKey } from "@/types/navigation";
import type { AuthUser } from "@/server/auth/session";

export const dynamic = "force-dynamic";

type RenderContext = {
  user: AuthUser | null;
  pathname: string;
};

async function renderScreen(screen: ScreenKey, context: RenderContext) {
  const learningPath = parseLearningContentPath(context.pathname);
  const practicePath = parsePracticeContentPath(context.pathname);

  if (learningPath && context.user) {
    if (learningPath.kind === "subject") {
      const data = await listChaptersForSubject(learningPath.subjectSlug);
      return <SubjectWorkspace subject={data.subject.name} contentSubject={data.subject} contentChapters={data.chapters} />;
    }

    if (learningPath.kind === "chapter") {
      const data = await listLessonsForChapter(learningPath.chapterSlug);
      return <ChapterLessons subject={data.subject} chapter={data.chapter} lessons={data.lessons} />;
    }

    if (learningPath.kind === "lesson") {
      return <LessonExperience lesson={await getLessonDetail(learningPath.lessonSlug)} />;
    }
  }

  if (practicePath && context.user) {
    if (practicePath.kind === "subject") {
      const data = await listQuestionsForSubject(practicePath.subjectSlug);
      return <ChapterPractice subject={data.subject} questions={data.questions} />;
    }

    if (practicePath.kind === "chapter") {
      const data = await listQuestionsForChapter(practicePath.chapterSlug);
      return <ChapterPractice subject={data.subject} chapter={data.chapter} questions={data.questions} />;
    }

    if (practicePath.kind === "question") {
      return <QuestionExperience question={await getQuestion(practicePath.questionId)} />;
    }
  }

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
      if (!context.user) {
        redirect("/login");
      }
      return <MissionFlow screen={screen} exams={await listSupportedExams()} profile={await getStudentProfile(context.user)} />;
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
      if (!context.user) {
        redirect("/login");
      }
      return <Home {...(await getMissionControl(context.user))} />;
    case "learn":
      if (!context.user) {
        redirect("/login");
      }
      return <Learn {...(await getStudentLearningHome(context.user))} />;
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
      if (!context.user) {
        redirect("/login");
      }
      return <Practice {...(await getStudentPracticeHome(context.user))} />;
    case "practicePhysics":
      return <ChapterPractice {...(await listQuestionsForSubject("physics"))} />;
    case "practiceQuestion":
      if (!context.user) {
        redirect("/login");
      }
      return <QuestionExperience question={(await listQuestions({ exam: (await getStudentPracticeHome(context.user)).exam?.code })).at(0) ?? null} />;
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
      if (!context.user) {
        redirect("/login");
      }
      return <Me profile={await getStudentProfile(context.user)} />;
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

function getPath(path?: string[]) {
  if (!path || path.length === 0) {
    return "/";
  }

  return `/${path.join("/")}`;
}

function isPublicDemoPath(pathname: string) {
  return pathname === "/demo" || pathname === "/demo/start" || pathname === "/presentation-summary";
}

function isPublicPath(pathname: string) {
  return pathname === "/" || pathname === "/login" || pathname === "/signup" || isPublicDemoPath(pathname);
}

function parseLearningContentPath(pathname: string) {
  const reserved = new Set(["revision", "downloads", "search"]);
  const parts = pathname.split("/").filter(Boolean);

  if (parts[0] !== "learn" || parts.length < 2 || reserved.has(parts[1])) {
    return null;
  }

  if (parts.length === 2) {
    return { kind: "subject" as const, subjectSlug: parts[1] };
  }

  if (parts.length === 3) {
    return { kind: "chapter" as const, subjectSlug: parts[1], chapterSlug: parts[2] };
  }

  if (parts.length === 4) {
    return { kind: "lesson" as const, subjectSlug: parts[1], chapterSlug: parts[2], lessonSlug: parts[3] };
  }

  return null;
}

function parsePracticeContentPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);

  if (parts[0] !== "practice") {
    return null;
  }

  if (parts.length === 4 && parts[1] === "subjects" && parts[3] === "questions") {
    return { kind: "subject" as const, subjectSlug: parts[2] };
  }

  if (parts.length === 4 && parts[1] === "chapters" && parts[3] === "questions") {
    return { kind: "chapter" as const, chapterSlug: parts[2] };
  }

  if (parts.length === 3 && parts[1] === "questions") {
    return { kind: "question" as const, questionId: parts[2] };
  }

  return null;
}

function isStudentOnboardingPath(screen: ScreenKey) {
  return screen === "onboarding" || screen === "missionExam" || screen === "missionYear" || screen === "missionCollege" || screen === "missionHours" || screen === "missionReady";
}

function isStudentAppScreen(screen: ScreenKey) {
  return [
    "home",
    "learn",
    "learnPhysics",
    "learnChemistry",
    "learnBiology",
    "lessonMotion",
    "learnRevision",
    "learnDownloads",
    "learnSearch",
    "practice",
    "practicePhysics",
    "practiceQuestion",
    "practiceComplete",
    "practiceReview",
    "practiceMockTests",
    "practicePapers",
    "progress",
    "tara",
    "taraChatStudy",
    "taraChatMotivate",
    "taraChatPlan",
    "taraChatRevise",
    "taraChatConcept",
    "taraChatAsk",
    "taraMoodGreat",
    "taraMoodOkay",
    "taraMoodStressed",
    "taraMoodTired",
    "taraReflection",
    "me",
    "settings",
  ].includes(screen);
}

function Unauthorized() {
  return (
    <main className="auth-container">
      <section className="auth-panel compact-auth">
        <div className="auth-form">
          <h1 className="section-title">Access restricted</h1>
          <p className="section-subtitle">Your account does not have access to this area yet.</p>
          <a className="button button-primary" href="/home">Back to Mission Control</a>
        </div>
      </section>
    </main>
  );
}

export default async function Page({ params }: { params: Promise<{ path?: string[] }> }) {
  const resolvedParams = await params;
  const pathname = getPath(resolvedParams.path);

  if (pathname === "/unauthorized") {
    await requireAuth();
    return <Unauthorized />;
  }

  const route = getRoute(pathname);
  let user: AuthUser | null = null;
  const isLearningContent = Boolean(parseLearningContentPath(pathname));
  const isPracticeContent = Boolean(parsePracticeContentPath(pathname));

  if (!isPublicPath(pathname)) {
    if (route.screen === "parentPreview") {
      user = await requireRole(parentRoles);
    } else if (route.screen === "schoolPreview") {
      user = await requireRole(schoolRoles);
    } else if (isLearningContent || isPracticeContent || isStudentAppScreen(route.screen) || isStudentOnboardingPath(route.screen)) {
      user = await requireRole(["STUDENT"]);
    } else {
      user = await requireAuth();
    }
  }

  if (user?.role === "STUDENT") {
    const status = await getOnboardingStatus(user);

    if (route.screen === "onboarding" && status.completed) {
      redirect("/home");
    }

    if (route.screen === "missionReady" && !status.completed) {
      redirect("/mission/exam");
    }

    if ((isLearningContent || isPracticeContent || isStudentAppScreen(route.screen)) && !status.completed) {
      redirect("/onboarding");
    }
  }

  const screen = await renderScreen(route.screen, { user, pathname });

  if (!route.isAppRoute && !isLearningContent && !isPracticeContent) {
    return <div className="app-shell">{screen}</div>;
  }

  const isDemoMode = isPublicDemoPath(pathname);

  return (
    <>
      <AppShell currentPath={isLearningContent ? "/learn" : isPracticeContent ? "/practice" : route.path}>{screen}</AppShell>
      {isDemoMode ? <ProductTour currentPath={route.path} /> : null}
      {isDemoMode ? <PresenterPanel currentPath={route.path} /> : null}
      <ToastStack />
    </>
  );
}
