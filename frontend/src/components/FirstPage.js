import React, { lazy, Suspense, useEffect, useState } from "react";
import { getParticipantSession, initParticipantSession } from "../api/sessionApi.js";
import { ParticipantContext } from "../context/ParticipantContext";
import Room from "./Room/Room";
import {
  BrowserRouter as Router,
  Route,
  Navigate,
  Routes,
  useNavigate
} from "react-router-dom";
import EndPage from "./EndRoom/EndPage";
import ErrorPage from "./ErrorPages/ErrorPage";
import PrivacyComponent from "./Privacy/PrivacyComponent";
import Version from "./Version/version";

const SettingsPage = lazy(() => import("./UserRoom/NewSettingsFirst/settings"));
const ConfirmTextDesign = lazy(
  () => import("./UserRoom/ConfirmTextDesign/ConfirmTextDesign")
);
const SettingsPageSecond = lazy(
  () => import("./UserRoom/UserSettingsSecond/SettingsSecond")
);
const SettingsPageSecondTwo = lazy(
  () => import("./UserRoom/UserSettingsSecond/SettingsPageSecondTwo")
);
const UserPage = lazy(() => import("./UserRoom/UserOverview/UserPage"));
const UserSettingsPage = lazy(
  () => import("./UserRoom/UserSettingsFirst/UserSettingsPage")
);
const UserSettingsPageSecond = lazy(
  () => import("./UserRoom/UserSettingsSecond/UserSettingsPageSecond")
);
const UserTutorialPage = lazy(
  () => import("./UserRoom/UserTutorial/UserTutorialPage")
);
const UserResultPage = lazy(
  () => import("./UserRoom/UserResult/UserResultPage")
);
const UserProfilePage = lazy(
  () => import("./UserRoom/UserProfile/UserProfile")
);
const WrappedPage = lazy(() => import("./Wrapped/WrappedPage"));
const ScreenoutPage = lazy(() => import("./ScreenoutPage/ScreenoutPage"));

const LoginPage = lazy(() => import("./Login/SignIn"));
const SignUpPage = lazy(() => import("./SignUp/SignUp"));

function AppRoutes() {
  const navigate = useNavigate();

  const [welcomePageOK, setWelcomePageOK] = useState(false)
  const [roomCode, setRoomCode] = useState(null)
  const [participant, setParticipant] = useState(null)
  const [surveyID, setSurveyID] = useState(null)
  const [language, setLanguage] = useState(null)
  const [paramsObjectSession, setParamsObjectSession] = useState(null)
  const [createRoom, setCreateRoom] = useState(null)
  const [redirectCheck, setRedirect] = useState(null)

  function clearRoomCode() {
    setRoomCode(null)
  }

  function paramsToObject(entries) {
    const result = []
    for (const [key, value] of entries) {
      result.push([key, value])
    }
    return result;
  }

  function TimeoutRedirect() {
    const navigate = useNavigate();

    useEffect(() => {
      const timer = setTimeout(() => {
        navigate('/error', { replace: true });
      }, 2000); // 2 second timeout

      return () => clearTimeout(timer);
    }, [navigate]);

    return null; // Or show a loading spinner if you prefer
  }

  useEffect(() => {
    const url = new URL(window.location.href)
    const surveyID = url.searchParams.get('surveyID')
    const participant = url.searchParams.get('participant')
    const lang = url.searchParams.get('lang')
    const oauthComplete = url.searchParams.get('oauth_complete')

    if (oauthComplete === 'true' && !createRoom) {
      getParticipantSession()
        .then((data) => {
          if (data.surveyID && data.participant) {
            setSurveyID(data.surveyID);
            setLanguage(data.language);
            setRoomCode(data.roomCode);
            setParticipant(data.participant);
            setWelcomePageOK(true);
            setParamsObjectSession(data.paramsObject);
            setCreateRoom(true);
            window.history.replaceState({}, "", "/");
          }
        });
    }
    else if (!createRoom && surveyID && participant) {
      const currentPath = window.location.pathname;
      if (currentPath && (currentPath.includes("/end-room") || currentPath.includes("/user-wrapped"))) {
        return;
      }
      const paramsObject = paramsToObject(url.searchParams)
      initParticipantSession({
        surveyID,
        participant,
        lang,
        paramsObject,
      })
        .then((response) => {
          if (!response.ok) {
            navigate("/error");
            return null;
          }
          return response.json();
        })
        .then(() => {
          setCreateRoom(true);
        })
        .catch((error) => {
          console.error("Session initialization failed:", error);
          navigate("/error");
        });
    }
  }, [createRoom, navigate]);

  useEffect(() => {
    if (createRoom) {
      getParticipantSession()
        .then((data) => {
          if (!data.surveyID) {
            if (!data.resultExist) {
              setRedirect(true);
            }
          }
          setSurveyID(data.surveyID);
          setLanguage(data.language);
          setRoomCode(data.roomCode);
          setParticipant(data.participant);
          setParamsObjectSession(data.paramsObject);
        });
    }
  }, [createRoom])

  return (
    <ParticipantContext.Provider value={{ participant, roomCode, surveyID, language }}>
      <Suspense fallback={null}>
        <Routes>
          <Route
            exact
            path="/"
            element={!roomCode && !surveyID && !participant && !language ?
              redirectCheck ? <Navigate to={'/login'} replace /> :
                <TimeoutRedirect /> :
              <Navigate to={'/room'} replace />
            }
          />
          <Route
            path="/room"
            element={
              <Room
                surveyID={surveyID}
                roomCode={roomCode}
                participant={participant}
                leaveRoomCallback={clearRoomCode}
                welcomePageOK={welcomePageOK}
                setWelcomePageOK={setWelcomePageOK}
                language={language}
                paramsObjectSession={paramsObjectSession}
              />
            }
          />
          <Route path="/user/settings/new" element={<SettingsPage />} />
          <Route
            path="/user/settings/confirm-text-design"
            element={<ConfirmTextDesign />}
          />
          <Route path="/user/settings2/new" element={<SettingsPageSecond />} />
          <Route path="/user/settings2/new2" element={<SettingsPageSecondTwo />} />
          <Route exact path="/user" element={<UserTutorialPage />} />
          <Route exact path="/user/settings" element={<UserSettingsPage />} />
          <Route exact path="/user/settings2" element={<UserSettingsPageSecond />} />
          <Route exact path="/user/tutorial" element={<UserTutorialPage />} />
          <Route exact path="/user/results" element={<UserResultPage />} />
          <Route exact path="/user/profile" element={<UserProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path='/end-room' element={<EndPage />} />
          <Route path="/user-wrapped" element={<WrappedPage />} />
          <Route path={'/privacy'} element={<PrivacyComponent />} />
          <Route path={'/version'} element={<Version />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/screenout" element={<ScreenoutPage />} />
        </Routes>
      </Suspense>
    </ParticipantContext.Provider>
  );
}

export default function FirstPage() {
  return (
    <Router>
      <AppRoutes />  { }
    </Router>
  );
}