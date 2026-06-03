import * as React from "react";
import { Collapse, Snackbar, Alert } from '@mui/material';
import { IconButton } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router";
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Mousewheel } from "swiper";
import headerSettings from '../Header/headerSettings';
import Dialog from '@mui/material/Dialog';
import SettingsDialog from './Dialog/SettingsDialog';
import { backButtonPressed, goBackToLogin } from './Button/BackButtonFunction';
import { mainSettingsCard } from './SettingsCard/mainSettingsCard';
import { tracksSettingsCard } from './SettingsCard/tracksSettingsCard';
import { usersSettingsCard } from './SettingsCard/usersSettingsCard';
import { playlistSettingsCard } from './SettingsCard/playlistSettingsCard';
import { showsSettingsCard } from './SettingsCard/showsSettingsCard';
import { endSettingsCard } from "./SettingsCard/endSettingsCard";
import { saveButton } from './Button/openSettingsDialog';
import {
  checkSurveyId,
  fetchSurveySettingsById,
  fetchUserSession,
} from "../../../api/surveyApi";
import Header from '../Header/Header';

export default function SettingsPage(props) {

  const [savedTracksLimit, setSavedTracksLimit] = useState(20)
  const [topItemsTracksShortTermLimit, setTopItemsTracksShortTermLimit] = useState(20)
  const [topItemsTracksMediumTermLimit, setTopItemsTracksMediumTermLimit] = useState(20)
  const [topItemsTracksLongTermLimit, setTopItemsTracksLongTermLimit] = useState(20)
  const [topItemsArtistsShortTermLimit, setTopItemsArtistsShortTermLimit] = useState(20)
  const [topItemsArtistsMediumTermLimit, setTopItemsArtistsMediumTermLimit] = useState(20)
  const [topItemsArtistsLongTermLimit, setTopItemsArtistsLongTermLimit] = useState(20)
  const [followedArtistsLimit, setFollowedArtistsLimit] = useState(20)
  const [savedShowsLimit, setSavedShowsLimit] = useState(20);
  const [savedEpisodesLimit, setSavedEpisodesLimit] = useState(20);
  const [tracksMarket, setTracksMarket] = useState({ Code: "DE", Name: "Germany" })

  const [savedTracksChecked, setSavedTracksChecked] = useState(false);
  const [topItemsTracksShortTermChecked, setTopItemsTracksShortTermChecked] = useState(false);
  const [topItemsTracksMediumTermChecked, setTopItemsTracksMediumTermChecked] = useState(false);
  const [topItemsTracksLongTermChecked, setTopItemsTracksLongTermChecked] = useState(false);
  const [currentUsersChecked, setCurrentUsersChecked] = useState(false);
  const [topItemsArtistsShortTermChecked, setTopItemsArtistsShortTermChecked] = useState(false);
  const [topItemsArtistsMediumTermChecked, setTopItemsArtistsMediumTermChecked] = useState(false);
  const [topItemsArtistsLongTermChecked, setTopItemsArtistsLongTermChecked] = useState(false);
  const [followedArtistsChecked, setFollowedArtistsChecked] = useState(false);
  const [savedShowsChecked, setSavedShowsChecked] = useState(false);
  const [savedEpisodesChecked, setSavedEpisodesChecked] = useState(false);

  const [confirmSavedTracksYes, setConfirmSavedTracksYes] = useState(true)
  const [confirmTopItemsTracksShortTermYes, setConfirmTopItemsTracksShortTermYes] = useState(true)
  const [confirmTopItemsTracksMediumTermYes, setConfirmTopItemsTracksMediumTermYes] = useState(true)
  const [confirmTopItemsTracksLongTermYes, setConfirmTopItemsTracksLongTermYes] = useState(true)
  const [confirmTopItemsArtistsShortTermYes, setConfirmTopItemsArtistsShortTermYes] = useState(true)
  const [confirmTopItemsArtistsMediumTermYes, setConfirmTopItemsArtistsMediumTermYes] = useState(true)
  const [confirmTopItemsArtistsLongTermYes, setConfirmTopItemsArtistsLongTermYes] = useState(true)
  const [confirmFollowedArtistsYes, setConfirmFollowedArtistsYes] = useState(true)
  const [confirmCurrentPlaylistsYes, setConfirmCurrentPlaylistsYes] = useState(true)
  const [confirmRecentlyTracksYes, setConfirmRecentlyTracksYes] = useState(true)
  const [confirmSavedShowsYes, setConfirmSavedShowsYes] = useState(true)
  const [confirmSavedEpisodesYes, setConfirmSavedEpisodesYes] = useState(true)

  const [secondSurveyCheck, setSecondSurveyCheck] = useState(true)

  const [openSettingsListItem, setOpenSettingsListItem] = useState([true, false, false, false, false, false])

  const [confirmArray, setConfirmArray] = useState([true, false, true, true, true, true, true, true, true, true, true, true, true])

  const [currentPlaylistsLimit, setCurrentPlaylistsLimit] = useState(20)
  const [currentPlaylistsChecked, setCurrentPlaylistsChecked] = useState(false)
  const [checkPublic, setCheckPublic] = useState(true)
  const [checkPrivateTracks, setCheckPrivateTracks] = useState(false)
  const [recentlyTracksLimit, setRecentlyTracksLimit] = useState(20)
  const [recentlyTracksChecked, setRecentlyTracksChecked] = useState(false)
  const [mySwiper, setMySwiper] = useState({})
  const [mySwiperActiveIndex, setMySwiperActiveIndex] = useState(0)
  const [username, setUsername] = useState(null)
  const [umfrageName, setUmfrageName] = useState('')
  const [umfrageID, setUmfrageID] = useState('')
  const [surveyIDError, setSurveyIDError] = useState('')
  const [surveyIDChecking, setSurveyIDChecking] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [umfrageEndUrl, setUmfrageEndUrl] = useState('')
  const [secondSurveyServer, setSecondSurveyServer] = useState('')
  const [secondSurveyID, setSecondSurveyID] = useState('')
  const [secondSurveyLanguage, setSecondSurveyLanguage] = useState('')
  const [changeTextfield, setChangeTextfield] = useState(false)
  const [countCheckboxen, setCountCheckboxen] = useState(0)
  const [openDialog, setOpenDialog] = useState(false);
  const [settingsCheckArray, setSettingsCheckArray] = useState([false, false, false, false, false, false, false, false, false, false, false, false, false])
  const [settingsLimitArray, setSettingsLimitArray] = useState(
    [[savedTracksLimit, tracksMarket], [], [topItemsTracksShortTermLimit], [topItemsTracksMediumTermLimit], [topItemsTracksLongTermLimit],
    [topItemsArtistsShortTermLimit], [topItemsArtistsMediumTermLimit], [topItemsArtistsLongTermLimit], [followedArtistsLimit],
    [currentPlaylistsLimit, checkPublic, checkPrivateTracks], [recentlyTracksLimit], [savedShowsLimit], [savedEpisodesLimit]]
  )
  const [settingsTextArray, setSettingsTextArray] = useState(['', '', ''])

  const [stateTextTT, setStateTextTT] = useState('')
  const [stateTextTA, setStateTextTA] = useState('')
  const [stateTextFA, setStateTextFA] = useState('')
  const [stateTextST, setStateTextST] = useState('')
  const [stateTextRT, setStateTextRT] = useState('')
  const [stateTextCP, setStateTextCP] = useState('')

  const [endURL, setEndURL] = useState('')
  const [shareSurveyUrl, setShareSurveyUrl] = useState('')
  const [endOption, setEndOption] = useState('plain')
  const [conditionalEndURLParameter, setConditionalEndURLParameter] = useState('')
  const [conditionalEndURLOption, setConditionalEndURLOption] = useState('plain')
  const [savedTracksFollowUp, setSavedTracksFollowUp] = useState(0)
  const [topTracksShortTermFollowUp, setTopTracksShortTermFollowUp] = useState(0)
  const [topTracksMediumTermFollowUp, setTopTracksMediumTermFollowUp] = useState(0)
  const [topTracksLongTermFollowUp, setTopTracksLongTermFollowUp] = useState(0)
  const [topArtistsShortTermFollowUp, setTopArtistsShortTermFollowUp] = useState(0)
  const [topArtistsMediumTermFollowUp, setTopArtistsMediumTermFollowUp] = useState(0)
  const [topArtistsLongTermFollowUp, setTopArtistsLongTermFollowUp] = useState(0)
  const [followedArtistsFollowUp, setFollowedArtistsFollowUp] = useState(0)
  const [currentPlaylistsFollowUp, setCurrentPlaylistsFollowUp] = useState(0)
  const [recentlyTracksFollowUp, setRecentlyTracksFollowUp] = useState(0)
  const [savedShowsFollowUp, setSavedShowsFollowUp] = useState(0)
  const [savedEpisodesFollowUp, setSavedEpisodesFollowUp] = useState(0)
  const [collectEmails, setCollectEmails] = useState(false)
  const [emailTextEn, setEmailTextEn] = useState("If you would like to participate in the lottery, please provide your email address below. Your email address will only be used for the purpose of the lottery, will not be shared with any third parties, and will be deleted immediately after the lottery is completed.")
  const [emailTextDe, setEmailTextDe] = useState("Wenn Sie an der Verlosung teilnehmen möchten, geben Sie bitte Ihre E-Mail-Adresse unten ein. Ihre E-Mail-Adresse wird nur für die Verlosung verwendet, nicht an Dritte weitergegeben und sofort nach Abschluss der Verlosung gelöscht.")
  const [endSettings, setEndSettings] = useState({
    endURL: endURL,
    shareSurveyUrl: shareSurveyUrl,
    endOption: endOption,
    conditionalEndURLParameter: conditionalEndURLParameter,
    conditionalEndURLOption: conditionalEndURLOption,
    savedTracksFollowUp: savedTracksFollowUp,
    topTracksShortTermFollowUp: topTracksShortTermFollowUp,
    topTracksMediumTermFollowUp: topTracksMediumTermFollowUp,
    topTracksLongTermFollowUp: topTracksLongTermFollowUp,
    topArtistsShortTermFollowUp: topArtistsShortTermFollowUp,
    topArtistsMediumTermFollowUp: topArtistsMediumTermFollowUp,
    topArtistsLongTermFollowUp: topArtistsLongTermFollowUp,
    followedArtistsFollowUp: followedArtistsFollowUp,
    currentPlaylistsFollowUp: currentPlaylistsFollowUp,
    recentlyTracksFollowUp: recentlyTracksFollowUp,
    savedShowsFollowUp: savedShowsFollowUp,
    savedEpisodesFollowUp: savedEpisodesFollowUp,
    collectEmails: collectEmails,
    emailTextEn: emailTextEn,
    emailTextDe: emailTextDe
  })

  const [screenoutOption, setScreenoutOption] = useState('page')
  const [screenoutURL, setScreenoutURL] = useState('')
  const [conditionalScreenoutURLParameter, setConditionalScreenoutURLParameter] = useState('')
  const [screenoutMinData, setScreenoutMinData] = useState(0)
  const [screenoutCheckIdentical, setScreenoutCheckIdentical] = useState(false)
  const [screenoutSettings, setScreenoutSettings] = useState({
    screenoutOption: screenoutOption,
    screenoutURL: screenoutURL,
    conditionalScreenoutURLParameter: conditionalScreenoutURLParameter,
    screenoutMinData: screenoutMinData,
    screenoutCheckIdentical: screenoutCheckIdentical
  })


  useEffect(() => {
    setConfirmArray([confirmSavedTracksYes, false, confirmTopItemsTracksShortTermYes, confirmTopItemsTracksMediumTermYes, confirmTopItemsTracksLongTermYes,
      confirmTopItemsArtistsShortTermYes, confirmTopItemsArtistsMediumTermYes, confirmTopItemsArtistsLongTermYes, confirmFollowedArtistsYes,
      confirmCurrentPlaylistsYes, confirmRecentlyTracksYes, confirmSavedShowsYes, confirmSavedEpisodesYes])
  }, [confirmSavedTracksYes, confirmTopItemsTracksShortTermYes, confirmTopItemsTracksMediumTermYes, confirmTopItemsTracksLongTermYes,
    confirmTopItemsArtistsShortTermYes, confirmTopItemsArtistsMediumTermYes, confirmTopItemsArtistsLongTermYes, confirmFollowedArtistsYes,
    confirmCurrentPlaylistsYes, confirmRecentlyTracksYes, confirmSavedShowsYes, confirmSavedEpisodesYes])

  useEffect(() => {
    setEndSettings({
      endURL: endURL,
      shareSurveyUrl: shareSurveyUrl,
      endOption: endOption,
      conditionalEndURLParameter: conditionalEndURLParameter,
      conditionalEndURLOption: conditionalEndURLOption,
      savedTracksFollowUp: savedTracksFollowUp,
      topTracksShortTermFollowUp: topTracksShortTermFollowUp,
      topTracksMediumTermFollowUp: topTracksMediumTermFollowUp,
      topTracksLongTermFollowUp: topTracksLongTermFollowUp,
      topArtistsShortTermFollowUp: topArtistsShortTermFollowUp,
      topArtistsMediumTermFollowUp: topArtistsMediumTermFollowUp,
      topArtistsLongTermFollowUp: topArtistsLongTermFollowUp,
      followedArtistsFollowUp: followedArtistsFollowUp,
      currentPlaylistsFollowUp: currentPlaylistsFollowUp,
      recentlyTracksFollowUp: recentlyTracksFollowUp,
      savedShowsFollowUp: savedShowsFollowUp,
      savedEpisodesFollowUp: savedEpisodesFollowUp,
      collectEmails: collectEmails,
      emailTextEn: emailTextEn,
      emailTextDe: emailTextDe
    });
  }, [endURL, shareSurveyUrl, endOption, conditionalEndURLParameter, conditionalEndURLOption, savedTracksFollowUp, topTracksShortTermFollowUp, topTracksMediumTermFollowUp, topTracksLongTermFollowUp,
    topArtistsShortTermFollowUp, topArtistsMediumTermFollowUp, topArtistsLongTermFollowUp, followedArtistsFollowUp,
    currentPlaylistsFollowUp, recentlyTracksFollowUp, savedShowsFollowUp, savedEpisodesFollowUp, collectEmails, emailTextEn, emailTextDe
  ])

  useEffect(() => {
    setScreenoutSettings({
      screenoutOption: screenoutOption,
      screenoutURL: screenoutURL,
      conditionalScreenoutURLParameter: conditionalScreenoutURLParameter,
      screenoutMinData: screenoutMinData,
      screenoutCheckIdentical: screenoutCheckIdentical
    })
  }, [screenoutOption, screenoutURL, conditionalScreenoutURLParameter, screenoutMinData, screenoutCheckIdentical])

  const navigate = useNavigate();
  const location = useLocation();

  const update = location.state?.update ? true : false

  useEffect(() => {
    if (update || !umfrageID || umfrageID.trim() === '') {
      setSurveyIDError('')
      return
    }

    const timeoutID = setTimeout(() => {
      setSurveyIDChecking(true)

      checkSurveyId(umfrageID)
        .then(({ ok, data }) => {
          setSurveyIDChecking(false)
          if (!ok || !data) {
            return;
          }
          if (data.exists) {
            setSurveyIDError('This Survey ID already exists (possibly created by another user). Please use a different ID.')
          } else {
            setSurveyIDError('')
          }
        })
        .catch(error => {
          setSurveyIDChecking(false)
          console.error('Error checking survey ID:', error)
        })
    }, 500)
    return () => clearTimeout(timeoutID)
  }, [umfrageID, update])


  useEffect(() => {
    if (update) {
      fetchSurveySettingsById(location.state?.surveyID)
        .then((data) => {
          if (!data || data.error) {
            return;
          }
          const raw = data.data[0]
          const savedTracks = raw.saved_tracks
          const profile = raw.profile
          const topTracksShortTerm = raw.top_tracks_shortterm
          const topTracksMediumTerm = raw.top_tracks_mediumterm
          const topTracksLongTerm = raw.top_tracks_longterm
          const topArtistsShortTerm = raw.top_artists_shortterm
          const topArtistsMediumTerm = raw.top_artists_mediumterm
          const topArtistsLongTerm = raw.top_artists_longterm
          const followedArtists = raw.followed_artists
          const currentPlaylists = raw.current_playlists
          const recentlyPlayed = raw.recently_played
          const savedShows = raw.saved_shows
          const savedEpisodes = raw.saved_episodes
          const endOptions = raw.end_options
          const screenoutOptions = raw.screenout_options

          setUmfrageName(data.data[0].nameUmfrage)
          setUmfrageID(data.data[0].umfrageID)
          setSavedTracksLimit(savedTracks.limit)
          setTopItemsTracksShortTermLimit(topTracksShortTerm.limit)
          setTopItemsTracksMediumTermLimit(topTracksMediumTerm.limit)
          setTopItemsTracksLongTermLimit(topTracksLongTerm.limit)
          setTopItemsArtistsShortTermLimit(topArtistsShortTerm.limit)
          setTopItemsArtistsMediumTermLimit(topArtistsMediumTerm.limit)
          setTopItemsArtistsLongTermLimit(topArtistsLongTerm.limit)
          setFollowedArtistsLimit(followedArtists.limit)
          setTracksMarket({
            Code: savedTracks.marketCode,
            Name: savedTracks.market
          })
          setCurrentPlaylistsLimit(currentPlaylists.limit)
          setRecentlyTracksLimit(recentlyPlayed.limit)
          setSavedShowsLimit(savedShows.limit)
          setSavedEpisodesLimit(savedEpisodes.limit)

          setSavedTracksChecked(savedTracks.check)
          setTopItemsTracksShortTermChecked(topTracksShortTerm.check)
          setTopItemsTracksMediumTermChecked(topTracksMediumTerm.check)
          setTopItemsTracksLongTermChecked(topTracksLongTerm.check)
          setCurrentUsersChecked(profile.check)
          setTopItemsArtistsShortTermChecked(topArtistsShortTerm.check)
          setTopItemsArtistsMediumTermChecked(topArtistsMediumTerm.check)
          setTopItemsArtistsLongTermChecked(topArtistsLongTerm.check)
          setFollowedArtistsChecked(followedArtists.check)
          setRecentlyTracksChecked(recentlyPlayed.check)
          setCurrentPlaylistsChecked(currentPlaylists.check)
          setSavedShowsChecked(savedShows.check)
          setSavedEpisodesChecked(savedEpisodes.check)

          setConfirmSavedTracksYes(savedTracks.confirmCheck)
          setConfirmTopItemsTracksShortTermYes(topTracksShortTerm.confirmCheck)
          setConfirmTopItemsTracksMediumTermYes(topTracksMediumTerm.confirmCheck)
          setConfirmTopItemsTracksLongTermYes(topTracksLongTerm.confirmCheck)
          setConfirmTopItemsArtistsShortTermYes(topArtistsShortTerm.confirmCheck)
          setConfirmTopItemsArtistsMediumTermYes(topArtistsMediumTerm.confirmCheck)
          setConfirmTopItemsArtistsLongTermYes(topArtistsLongTerm.confirmCheck)
          setConfirmFollowedArtistsYes(followedArtists.confirmCheck)
          setConfirmCurrentPlaylistsYes(currentPlaylists.confirmCheck)
          setConfirmRecentlyTracksYes(recentlyPlayed.confirmCheck)
          setConfirmSavedShowsYes(savedShows.confirmCheck)
          setConfirmSavedEpisodesYes(savedEpisodes.confirmCheck)

          setCheckPublic(currentPlaylists.public ? currentPlaylists.public : false)
          setCheckPrivateTracks(currentPlaylists.privatetracks ? currentPlaylists.privatetracks : false);

          setSavedTracksFollowUp(savedTracks.followUp)
          setTopTracksShortTermFollowUp(topTracksShortTerm.followUp)
          setTopTracksMediumTermFollowUp(topTracksMediumTerm.followUp)
          setTopTracksLongTermFollowUp(topTracksLongTerm.followUp)
          setTopArtistsShortTermFollowUp(topArtistsShortTerm.followUp)
          setTopArtistsMediumTermFollowUp(topArtistsMediumTerm.followUp)
          setTopArtistsLongTermFollowUp(topArtistsLongTerm.followUp)
          setFollowedArtistsFollowUp(followedArtists.followUp)
          setCurrentPlaylistsFollowUp(currentPlaylists.followUp)
          setRecentlyTracksFollowUp(recentlyPlayed.followUp)
          setSavedShowsFollowUp(savedShows.followUp)
          setSavedEpisodesFollowUp(savedEpisodes.followUp)

          setEndOption(endOptions.option)
          setEndURL(endOptions.end_url)
          setShareSurveyUrl(endOptions.share_survey_url || '')
          setConditionalEndURLParameter(endOptions.conditional_end_url_parameter)
          setConditionalEndURLOption(endOptions.conditional_end_url_option)
          setCollectEmails(endOptions.collect_emails)
          setEmailTextEn(endOptions.email_text_en)
          setEmailTextDe(endOptions.email_text_de)

          setScreenoutOption(screenoutOptions.option)
          setScreenoutURL(screenoutOptions.screenout_url)
          setConditionalScreenoutURLParameter(screenoutOptions.conditional_screenout_url_parameter)
          setScreenoutMinData(screenoutOptions.screenout_min_data)
          setScreenoutCheckIdentical(screenoutOptions.screenout_check_identical)
        });
    }
  }, [update])

  useEffect(() => {
    setSettingsLimitArray([[savedTracksLimit, tracksMarket], [], [topItemsTracksShortTermLimit], [topItemsTracksMediumTermLimit], [topItemsTracksLongTermLimit],
    [topItemsArtistsShortTermLimit], [topItemsArtistsMediumTermLimit], [topItemsArtistsLongTermLimit],
    [followedArtistsLimit], [currentPlaylistsLimit, checkPublic, checkPrivateTracks], [recentlyTracksLimit], [savedShowsLimit], [savedEpisodesLimit]]);
  }, [savedTracksLimit, tracksMarket, topItemsTracksShortTermLimit, topItemsTracksMediumTermLimit, topItemsTracksLongTermLimit,
    topItemsArtistsShortTermLimit, topItemsArtistsMediumTermLimit, topItemsArtistsLongTermLimit,
    followedArtistsLimit, currentPlaylistsLimit, checkPublic, checkPrivateTracks, recentlyTracksLimit, savedShowsLimit, savedEpisodesLimit])



  useEffect(() => {
    if (!checkPublic && checkPrivateTracks) {
      setCheckPrivateTracks(false);
    }
  }, [checkPublic, checkPrivateTracks, setCheckPrivateTracks]);

  useEffect(() => {
    if (umfrageName !== '' && umfrageID !== '') {
      if (!secondSurveyCheck) {
        setChangeTextfield(true)
      }
      else {
        if (secondSurveyServer !== '' && secondSurveyID !== '' && secondSurveyLanguage !== '') {
          setChangeTextfield(true)
        } else {
          setChangeTextfield(false)
        }
      }
      setChangeTextfield(true)
    } else {
      setChangeTextfield(false)
    }
    setSettingsTextArray([umfrageName, umfrageID/* , umfrageEndUrl */])
  }, [umfrageName, umfrageID, secondSurveyID, secondSurveyLanguage, secondSurveyServer, secondSurveyCheck])



  useEffect(() => {
    let arr1 = [savedTracksChecked, currentUsersChecked, topItemsTracksShortTermChecked, topItemsTracksMediumTermChecked, topItemsTracksLongTermChecked,
      topItemsArtistsShortTermChecked, topItemsArtistsMediumTermChecked, topItemsArtistsLongTermChecked, followedArtistsChecked,
      currentPlaylistsChecked, recentlyTracksChecked, savedShowsChecked, savedEpisodesChecked]

    setSettingsCheckArray(arr1)

    const count1 = arr1.filter(value => value === true).length;
    setCountCheckboxen(count1)

  }, [savedTracksChecked, currentPlaylistsChecked, followedArtistsChecked, topItemsArtistsShortTermChecked, topItemsArtistsMediumTermChecked,
    topItemsArtistsLongTermChecked, currentUsersChecked, recentlyTracksChecked, topItemsTracksShortTermChecked,
    topItemsTracksMediumTermChecked, topItemsTracksLongTermChecked, savedShowsChecked, savedEpisodesChecked])


  useEffect(() => {
    async function getParticipantSession() {
      fetchUserSession().then(({ ok, data }) => {
        if (!ok || !data || data.username === null) {
          goBackToLogin(navigate)
          return;
        }
        setUsername(data.username)
      });
    }
    getParticipantSession();
  }, [])

  function openCollapse() {
    let items = [...openSettingsListItem];
    let itemNew = { ...items[mySwiper.activeIndex] };
    let itemOld = { ...items[mySwiper.previousIndex] };
    itemNew = true;
    itemOld = false;
    items[mySwiper.activeIndex] = itemNew;
    items[mySwiper.previousIndex] = itemOld;
    setOpenSettingsListItem(items);
  }

  const handleSettingsButtonPressed = (indexTo) => {
    mySwiper.slideTo(indexTo)
    openCollapse();
  }

  function handleCloseDialog() {
    setOpenDialog(false)
  }

  function renderDialog() {
    return (
      <React.Fragment>
        <Dialog
          fullWidth
          open={openDialog}
          onClose={handleCloseDialog}
          scroll={'paper'}
          aria-labelledby="scroll-dialog-title"
          aria-describedby="scroll-dialog-description"
        >
          {
            openDialog ?
              <SettingsDialog
                props={
                  [[openDialog, setOpenDialog],
                    settingsCheckArray,
                    settingsLimitArray,
                    settingsTextArray,
                    username,
                    confirmArray,
                    update,
                  location.state?.surveyID,
                    endSettings,
                    screenoutSettings,]
                }
              />
              : null
          }
        </Dialog>
      </React.Fragment>
    )
  }

  function renderSettingsPage() {
    return (
      <React.Fragment>
        <Header />
        <div class='setting-page-main'>
          <div class="setting-navigation">
            <div class="navbar-setting">
              <nav class="navbar-new-settings-content">
                <ul className="list-new-settings-container">
                  <list className='list-new-settings-item'>
                    <IconButton onClick={() => backButtonPressed(navigate)}>
                      <ArrowBackIosNewOutlinedIcon />
                    </IconButton>
                  </list>
                  <list className='list-new-settings-item-container'>
                    <a
                      class={mySwiper?.activeIndex === 0 ? 'list-new-settings-item-bold' : 'list-new-settings-item-regular'}
                      onClick={() => handleSettingsButtonPressed(0)}
                    >
                      Main Settings
                    </a>
                    <Collapse in={openSettingsListItem[0]} timeout="auto" unmountOnExit>
                      <ul className={"list-new-settings-collapse-inner"}>
                        <li className={"list-new-settings-collapse-item"}>
                          Settings Name
                        </li>
                        <li className={"list-new-settings-collapse-item"}>
                          Survey ID (1st Survey)
                        </li>
                      </ul>
                    </Collapse>
                  </list>
                  <list className='list-new-settings-item-container'>
                    <a
                      class={mySwiper?.activeIndex === 1 ? 'list-new-settings-item-bold' : 'list-new-settings-item-regular'}
                      onClick={() => handleSettingsButtonPressed(1)}
                    >
                      Tracks
                    </a>
                    <Collapse in={openSettingsListItem[1]} timeout="auto" unmountOnExit>
                      <ul className={"list-new-settings-collapse-inner"}>
                        <li className={"list-new-settings-collapse-item"}>
                          Get User's Saved Tracks
                        </li>
                        <li className={"list-new-settings-collapse-item"}>
                          Get RecentlyPlayed Tracks
                        </li>
                      </ul>
                    </Collapse>
                  </list>
                  <list className='list-new-settings-item-container'>
                    <a
                      class={mySwiper?.activeIndex === 2 ? 'list-new-settings-item-bold' : 'list-new-settings-item-regular'}
                      onClick={() => handleSettingsButtonPressed(2)}
                    >
                      User's
                    </a>
                    <Collapse in={openSettingsListItem[2]} timeout="auto" unmountOnExit>
                      <ul className={"list-new-settings-collapse-inner"}>
                        <li className={"list-new-settings-collapse-item"}>
                          Get Current User's Profile
                        </li>
                        <li className={"list-new-settings-collapse-item"}>
                          Get User's Top Items (Tracks)
                        </li>
                        <li className={"list-new-settings-collapse-item"}>
                          Get User's Top Items (Artists)
                        </li>
                        <li className={"list-new-settings-collapse-item"}>
                          Get Followed Artists
                        </li>
                      </ul>
                    </Collapse>
                  </list>
                  <list className='list-new-settings-item-container'>
                    <a
                      class={mySwiper?.activeIndex === 3 ? 'list-new-settings-item-bold' : 'list-new-settings-item-regular'}
                      onClick={() => handleSettingsButtonPressed(3)}
                    >
                      Playlists
                    </a>
                    <Collapse in={openSettingsListItem[3]} timeout="auto" unmountOnExit>
                      <ul className={"list-new-settings-collapse-inner"}>
                        <li className={"list-new-settings-collapse-item"}>
                          Get Current User's Playlists
                        </li>
                      </ul>
                    </Collapse>
                  </list>
                  <list className='list-new-settings-item-container'>
                    <a
                      class={mySwiper?.activeIndex === 4 ? 'list-new-settings-item-bold' : 'list-new-settings-item-regular'}
                      onClick={() => handleSettingsButtonPressed(4)}
                    >
                      Shows
                    </a>
                    <Collapse in={openSettingsListItem[4]} timeout="auto" unmountOnExit>
                      <ul className={"list-new-settings-collapse-inner"}>
                        <li className={"list-new-settings-collapse-item"}>
                          Get User's Saved Shows
                        </li>
                        <li className={"list-new-settings-collapse-item"}>
                          Get User's Saved Episodes
                        </li>
                      </ul>
                    </Collapse>
                  </list>
                  <list className='list-new-settings-item-container'>
                    <a
                      class={mySwiper?.activeIndex === 5 ? 'list-new-settings-item-bold' : 'list-new-settings-item-regular'}
                      onClick={() => handleSettingsButtonPressed(5)}
                    >
                      End / Follow-up
                    </a>
                  </list>
                </ul>
              </nav>
            </div>
          </div>
          <div class="setting-content-main">
            <div class='setting-content-wrapper'>
              <div class="setting-content-wrapper-inner">
                <div class="setting-content-outer">
                  <Swiper
                    pagination={{
                      type: "progressbar"
                    }}
                    navigation={true}
                    allowTouchMove={false}
                    mousewheel={{ 'forceToAxis': true }}
                    modules={[Navigation, Pagination, Mousewheel]}
                    className="mySwiper"
                    onSwiper={setMySwiper}
                    onSlideChange={(swiper) => {
                      openCollapse();
                      setMySwiperActiveIndex(swiper.activeIndex)
                    }
                    }
                    onInit={(swiper) => {
                      setMySwiper(swiper)
                    }}
                    height={'100%'}
                  >
                    <SwiperSlide>
                      {mainSettingsCard(
                        umfrageName, setUmfrageName,
                        umfrageID, setUmfrageID,
                        surveyIDError, surveyIDChecking,
                        screenoutOption, setScreenoutOption,
                        screenoutURL, setScreenoutURL,
                        conditionalScreenoutURLParameter, setConditionalScreenoutURLParameter,
                        screenoutMinData, setScreenoutMinData,
                        screenoutCheckIdentical, setScreenoutCheckIdentical,
                      )}
                    </SwiperSlide>
                    <SwiperSlide>
                      {tracksSettingsCard(
                        savedTracksChecked, setSavedTracksChecked,
                        savedTracksLimit, setSavedTracksLimit,
                        tracksMarket, setTracksMarket,
                        confirmSavedTracksYes, setConfirmSavedTracksYes,
                        recentlyTracksChecked, setRecentlyTracksChecked,
                        recentlyTracksLimit, setRecentlyTracksLimit,
                        confirmRecentlyTracksYes, setConfirmRecentlyTracksYes,
                        setStateTextST, stateTextST, setStateTextRT, stateTextRT
                      )}
                    </SwiperSlide>
                    <SwiperSlide>
                      {usersSettingsCard(
                        currentUsersChecked, setCurrentUsersChecked,
                        topItemsTracksShortTermChecked, setTopItemsTracksShortTermChecked,
                        topItemsTracksShortTermLimit, setTopItemsTracksShortTermLimit,
                        topItemsTracksMediumTermChecked, setTopItemsTracksMediumTermChecked,
                        topItemsTracksMediumTermLimit, setTopItemsTracksMediumTermLimit,
                        topItemsTracksLongTermChecked, setTopItemsTracksLongTermChecked,
                        topItemsTracksLongTermLimit, setTopItemsTracksLongTermLimit,
                        topItemsArtistsShortTermChecked, setTopItemsArtistsShortTermChecked,
                        topItemsArtistsShortTermLimit, setTopItemsArtistsShortTermLimit,
                        topItemsArtistsMediumTermChecked, setTopItemsArtistsMediumTermChecked,
                        topItemsArtistsMediumTermLimit, setTopItemsArtistsMediumTermLimit,
                        topItemsArtistsLongTermChecked, setTopItemsArtistsLongTermChecked,
                        topItemsArtistsLongTermLimit, setTopItemsArtistsLongTermLimit,
                        followedArtistsChecked, setFollowedArtistsChecked,
                        followedArtistsLimit, setFollowedArtistsLimit,
                        confirmTopItemsTracksShortTermYes, setConfirmTopItemsTracksShortTermYes,
                        confirmTopItemsTracksMediumTermYes, setConfirmTopItemsTracksMediumTermYes,
                        confirmTopItemsTracksLongTermYes, setConfirmTopItemsTracksLongTermYes,
                        confirmTopItemsArtistsShortTermYes, setConfirmTopItemsArtistsShortTermYes,
                        confirmTopItemsArtistsMediumTermYes, setConfirmTopItemsArtistsMediumTermYes,
                        confirmTopItemsArtistsLongTermYes, setConfirmTopItemsArtistsLongTermYes,
                        confirmFollowedArtistsYes, setConfirmFollowedArtistsYes,
                        setStateTextTT, stateTextTT, setStateTextTA, stateTextTA,
                        setStateTextFA, stateTextFA
                      )}
                    </SwiperSlide>
                    <SwiperSlide>
                      {playlistSettingsCard(
                        currentPlaylistsChecked, setCurrentPlaylistsChecked,
                        currentPlaylistsLimit, setCurrentPlaylistsLimit,
                        confirmCurrentPlaylistsYes, setConfirmCurrentPlaylistsYes,
                        checkPublic, setCheckPublic, checkPrivateTracks, setCheckPrivateTracks,
                        stateTextCP, setStateTextCP
                      )}
                    </SwiperSlide>
                    <SwiperSlide>
                      {showsSettingsCard(
                        savedShowsChecked, setSavedShowsChecked,
                        savedShowsLimit, setSavedShowsLimit,
                        confirmSavedShowsYes, setConfirmSavedShowsYes,
                        savedEpisodesChecked, setSavedEpisodesChecked,
                        savedEpisodesLimit, setSavedEpisodesLimit,
                        confirmSavedEpisodesYes, setConfirmSavedEpisodesYes
                      )}
                    </SwiperSlide>
                    <SwiperSlide>
                      {endSettingsCard(
                        endOption, setEndOption,
                        endURL, setEndURL,
                        shareSurveyUrl, setShareSurveyUrl,
                        collectEmails, setCollectEmails,
                        emailTextEn, setEmailTextEn,
                        emailTextDe, setEmailTextDe,
                        conditionalEndURLParameter, setConditionalEndURLParameter,
                        conditionalEndURLOption, setConditionalEndURLOption,
                        savedTracksFollowUp, setSavedTracksFollowUp,
                        topTracksShortTermFollowUp, setTopTracksShortTermFollowUp,
                        topTracksMediumTermFollowUp, setTopTracksMediumTermFollowUp,
                        topTracksLongTermFollowUp, setTopTracksLongTermFollowUp,
                        topArtistsShortTermFollowUp, setTopArtistsShortTermFollowUp,
                        topArtistsMediumTermFollowUp, setTopArtistsMediumTermFollowUp,
                        topArtistsLongTermFollowUp, setTopArtistsLongTermFollowUp,
                        followedArtistsFollowUp, setFollowedArtistsFollowUp,
                        currentPlaylistsFollowUp, setCurrentPlaylistsFollowUp,
                        recentlyTracksFollowUp, setRecentlyTracksFollowUp,
                        savedShowsFollowUp, setSavedShowsFollowUp,
                        savedEpisodesFollowUp, setSavedEpisodesFollowUp
                      )}
                    </SwiperSlide>
                  </Swiper>
                </div>
              </div>
            </div>
          </div>
        </div>
        {saveButton(
          setOpenDialog,
          mySwiperActiveIndex, countCheckboxen, changeTextfield, update,
          endOption, endURL, conditionalEndURLParameter
        )}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      {renderSettingsPage()}
      {renderDialog()}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </React.Fragment>
  )
}

