import React from "react";
import SettingsPage from "./UserRoom/NewSettingsFirst/settings";
import SettingsPageSecond from "./UserRoom/UserSettingsSecond/SettingsSecond";
import UserPage from "./UserRoom/UserOverview/UserPage";
import Room from "./Room/Room";
import LoginPage from "./Login/SignIn";
import SignUpPage from "./SignUp/SignUp";
import {
  BrowserRouter as Router,
  Route,
  Navigate,
  Routes,
  useNavigate
} from "react-router-dom";
import { useState, useEffect } from 'react';
import CreateRoom from './CreateRoom.js';
import AudioFeaturesDashboard from './UserRoom/UserResult/AudioFeaturesDashboard.js';
import UserResultPage from './UserRoom/UserResult/UserResultPage.js';
import UserTutorialPage from './UserRoom/UserTutorial/UserTutorialPage.js';
import UserSettingsPage from './UserRoom/UserSettingsFirst/UserSettingsPage.js';
import UserSettingsPageSecond from './UserRoom/UserSettingsSecond/UserSettingsPageSecond.js';
import SettingsPageSecondTwo from './UserRoom/UserSettingsSecond/SettingsPageSecondTwo.js';
import EndPage from "./EndRoom/EndPage";
import ErrorPage from "./ErrorPages/ErrorPage";
import PrivacyComponent from "./Privacy/PrivacyComponent";
import ConfirmTextDesign from "./UserRoom/ConfirmTextDesign/ConfirmTextDesign";
import SpotiveyFooter from "./Footer/footerSpotivey";
import Version from "./Version/version";

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
    for(const [key, value] of entries) {
      result.push([key, value])
    }
    return result;
  }

  useEffect(() => {
    const url = new URL(window.location.href)
    const surveyID = url.searchParams.get('surveyID')
    const participant = url.searchParams.get('participant')
    const lang = url.searchParams.get('lang')
    const oauthComplete = url.searchParams.get('oauth_complete')
    
    if (oauthComplete === 'true' && !createRoom) {
      fetch("/api/get-participant-session")
        .then((response) => response.json())
        .then((data) => {
          if (data.surveyID && data.participant) {
            setSurveyID(data.surveyID)
            setLanguage(data.language)
            setRoomCode(data.roomCode)
            setParticipant(data.participant)
            setWelcomePageOK(data.privacy_accepted)
            setParamsObjectSession(data.paramsObject)
            setCreateRoom(true)
            window.history.replaceState({}, '', '/')
          }
        });
    }
    else if (!createRoom && surveyID && participant) {
      const paramsObject = paramsToObject(url.searchParams)
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyID,
          participant,
          lang,
          paramsObject,
        }),
      };
      
      fetch("/api/init-participant-session", requestOptions)
        .then((response) => {
          if (!response.ok) {
            if (response.status === 404) {
              navigate('/error/survey-not-found');
              return null
            }
            if (response.status === 400) {
              navigate('/error/missing-params');
              return null
            }
            navigate('/error/generic');
            return null
          }
          return response.json();
        })
        .then((data) => {
          setCreateRoom(true);
        })
        .catch((error) => {
          console.error('Session initialization failed:', error);
          navigate('/error/network-error');
        });
    }
  }, []);

  useEffect(() => {
    if (createRoom) {
      fetch("/api/get-participant-session")
        .then((response) => response.json())
        .then((data) => {
          if (!data.surveyID) {
            if (!data.resultExist){
              setRedirect(true)
            }
          }
          setSurveyID(data.surveyID)
          setLanguage(data.language)
          setRoomCode(data.roomCode)
          setParticipant(data.participant)
          setWelcomePageOK(data.privacy_accepted) 
          setParamsObjectSession(data.paramsObject)
        });
    }
  }, [createRoom])

  return (
    <>
      <Routes>
        <Route
          exact
          path="/"
          element={!roomCode && !surveyID && !participant && !language ?
            redirectCheck ? <Navigate to={'/login'} replace/> :
            <CreateRoom /> :
            <Navigate to={'/room'} replace/>
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
        <Route path="/user/settings/new" element={<SettingsPage/>} />
        <Route path="/user/settings/confirm-text-design" element={<ConfirmTextDesign/>} />
        <Route path="/user/settings2/new" element={<SettingsPageSecond/>} />
        <Route path="/user/settings2/new2" element={<SettingsPageSecondTwo/>} />
        <Route exact path="/user" element={<UserPage/>} />
        <Route exact path="/user/settings" element={<UserSettingsPage/>} />
        <Route exact path="/user/settings2" element={<UserSettingsPageSecond/>} />
        <Route exact path="/user/tutorial" element={<UserTutorialPage/>} />
        <Route exact path="/user/results" element={<UserResultPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/sign-up" element={<SignUpPage/>} />
        <Route exact path="/user/results-audio-features" element={<AudioFeaturesDashboard/>} />
        <Route path='/end-room/:lang' element={<EndPage/>} />
        <Route path={'/privacy'} element={<PrivacyComponent/>} />
        <Route path={'/version'} element={<Version/>} />
        <Route path="/error/:errorType" element={<ErrorPage/>} />
      </Routes>
      <div className="footer-container">
        <SpotiveyFooter participant={participant}/>
      </div>
    </>
  );
}

export default function FirstPage() {
  return (
    <Router>
      <AppRoutes />  {/* Our inner component with all the logic */}
    </Router>
  );
}