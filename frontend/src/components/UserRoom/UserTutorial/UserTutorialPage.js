import * as React from "react";
import Header from '../Header/Header';
import { useState, useEffect } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useNavigate } from "react-router-dom";
import TutorialContentNav from "./TutorialContentNav";
import { Box, Container, Paper, Typography } from "@mui/material";
import { fetchUserSession } from "../../../api/surveyApi";
import VersionDescription from "../../Version/VersionDescription";


export default function UserTutorialPage(props) {
  const [username, setUsername] = useState(null)
  const [collapseOpen, setCollapseOpen] = useState([false, false, false, false, false, false, false])
  const [lang, setLang] = useState('de')

  const navigate = useNavigate()

  useEffect(() => {
    async function getParticipantSession() {
      fetchUserSession().then(({ ok, data }) => {
        if (!ok || !data || data.username === null) {
          navigate('/login')
          return;
        }
        setUsername(data.username)
      });
    }
    getParticipantSession();
  }, [])

  function handleCollapseClicked(e, indexCollapse) {
    let items = [...collapseOpen];
    items[indexCollapse] = !items[indexCollapse];
    setCollapseOpen(items)
  }

  const listItem = ['User\'s Saved Tracks', 'Recently Played Tracks', 'User\'s Profile',
    'User\'s Top Items (Tracks)', 'User\'s Top Items (Artists)', 'User\'s Followed Artists',
    'User\'s Playlists', 'User\'s Saved Shows', 'User\'s Saved Episodes']

  function renderCollapseItem(index) {
    return (
      <React.Fragment>
        {index === 0 ?
          <React.Fragment>
            <h3 class='tutorial-list-collapse-title'>
              Get a list of the songs saved in the current Spotify user's 'Your Music' library.
            </h3>
            <h3 class='tutorial-list-collapse-text'>
              You can also set a limit (the amount of data collected)
              and the market (only content available in that market will be returned).
              In addition, it is specified whether a confirmation of the respondent is desired.
            </h3>
          </React.Fragment>
          : null}
        {index === 1 ?
          <React.Fragment>
            <h3 class='tutorial-list-collapse-title'>
              Get tracks from the current user's recently played tracks.
            </h3>
            <h3 class='tutorial-list-collapse-text'>
              You can also set a limit (the amount of data collected).
              In addition, it is specified whether a confirmation of the respondent is desired.
            </h3>
          </React.Fragment>
          : null}
        {index === 2 ?
          <React.Fragment>
            <h3 class='tutorial-list-collapse-title'>
              Get profile information about the current user.
            </h3>
            <h3 class='tutorial-list-collapse-text'>
              You get only the information about the user's Spotify subscription level,
              the total number of followers and the user's country.
            </h3>
          </React.Fragment>
          : null}
        {index === 3 ?
          <React.Fragment>
            <h3 class='tutorial-list-collapse-title'>
              Get the current user's top tracks based on calculated affinity.
            </h3>
            <h3 class='tutorial-list-collapse-text'>
              You can also set a limit (the amount of data collected).
              You can collect data for different time ranges (over which the affinity calculation is performed).
              In addition, it is specified whether a confirmation of the respondent is desired.
            </h3>
          </React.Fragment>
          : null}
        {index === 4 ?
          <React.Fragment>
            <h3 class='tutorial-list-collapse-title'>
              Get the current user's top artists based on calculated affinity.
            </h3>
            <h3 class='tutorial-list-collapse-text'>
              You can also set a limit (the amount of data collected).
              You can collect data for different time ranges (over which the affinity calculation is performed).
              In addition, it is specified whether a confirmation of the respondent is desired.
            </h3>
          </React.Fragment>
          : null}
        {index === 5 ?
          <React.Fragment>
            <h3 class='tutorial-list-collapse-title'>
              Get the current user's followed artists.
            </h3>
            <h3 class='tutorial-list-collapse-text'>
              You can also set a limit (the amount of data collected).
              In addition, it is specified whether a confirmation of the respondent is desired.
            </h3>
          </React.Fragment>
          : null}
        {index === 6 ?
          <React.Fragment>
            <h3 class='tutorial-list-collapse-title'>
              Get a list of the playlists owned or followed by the current Spotify user.
            </h3>
            <h3 class='tutorial-list-collapse-text'>
              You can also set a limit (the amount of data collected).
              In addition, it is specified whether a confirmation of the respondent is desired.
            </h3>
          </React.Fragment>
          : null}
        {index === 7 ?
          <React.Fragment>
            <h3 class='tutorial-list-collapse-title'>
              Get a list of the shows saved in the current Spotify user's library.
            </h3>
            <h3 class='tutorial-list-collapse-text'>
              You can also set a limit (the amount of data collected).
              In addition, it is specified whether a confirmation of the respondent is desired.
            </h3>
          </React.Fragment>
          : null}
        {index === 8 ?
          <React.Fragment>
            <h3 class='tutorial-list-collapse-title'>
              Get a list of the episodes saved in the current Spotify user's library.
            </h3>
            <h3 class='tutorial-list-collapse-text'>
              You can also set a limit (the amount of data collected).
              In addition, it is specified whether a confirmation of the respondent is desired.
            </h3>
          </React.Fragment>
          : null}
      </React.Fragment>
    )
  }

  function TutorialContent() {
    return (
      <React.Fragment>
        <div className="tutorial-content-body">
          <div id='introduction-tutorial'>
            <div className='settings-overview-title'>
              <h2 className="tutorial-content-title">
                Introduction
              </h2>
              <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
                In the following, the use of Spotivey is illustrated with the help of a tutorial.
                A basic prior knowledge of the handling of the Spotify API and
                the use of an online survey application is assumed.
              </Typography>
              <h3 class='settings-subtitle-text' style={{ marginTop: '24px' }}>
                Why Spotivey - Motivation
              </h3>
              <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
                Since music listening nowadays is increasingly dominated by streaming services such as Spotify,
                Apple Music or Amazon Music, it is be technically possible to perform research on music
                actually listened to on basis of 'digital traces' from those services (Greenberg & Rentfrow, 2017).
                This poses several advantages over self-reporting in questionnaires, a strategy which suffers from various
                validity issues (Lepa et al., 2020).
              </Typography>
              <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
                In principle, open APIs offered by music service providers can be used for this purpose.
                For example, by using the Spotify API, it is possible to obtain a wide range of music-related
                user account information, such as the music tracks most recently listened to,
                favorite songs or artists, as well as artists followed or playlists created.
                However, using the Spotify API is normally not possible without technical knowledge of
                web programming.
              </Typography>
              <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
                In addition, purely music-related transaction data without further socio-demographic
                contextual information is only helpful for academic research to a limited extent.
                A final problem is that streaming accounts are often used by several people at the same time,
                which makes it hard to attribute usage data to a specific person.
              </Typography>
              <h3 class='settings-subtitle-text' style={{ marginTop: '24px' }}>
                How does Spotivey work?
              </h3>
              <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
                Spotiveyallows to easily integrate most user data retrieval functions of the Spotify API
                within an online survey (Spotivey is optimized to work together with the open source survey creation tool LimeSurvey) in compliance with
                EU data protection regulations. With Spotivey, individual music usage data can be fetched without web programming knowledge and
                be linked directly with responses from a questionnaire (see Figure 1).
                Optionally, it is possible and recommended to ask survey participants to confirm individual results of
                Spotify data retrieval to exclude transactional
                data stemming from another person using the same account and to adhere to data protection guidelines.
              </Typography>
              <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
                {/* Furthermore, Spotify helps to automatically create LimeSurvey questions with reference
                to the collected music usage data for an optional follow-up online survey to be administered
                directly following data retrieval.
                For example, if the participants' last 20 songs listened to were fetched,
                their perceived emotional expression could then be asked for via rating items and a web music player. */}
                Results from Spotify API queries may be either displayed in the user area of Spotivey
                for a quick overview or downloaded together with the survey respondent ID as
                CSV files for extended statistical analyses.
              </Typography>
              <h3 class='settings-subtitle-text' style={{ marginTop: '24px' }}>
                Development and hosting of Spotivey
              </h3>
              <VersionDescription />
            </div>
            <div id='general-tutorial'>
              <div className='settings-overview-title'>
                <h2 className="tutorial-content-title">
                  Technical setup and requirements
                </h2>
              </div>
              <h3 className="settings-subtitle-text" style={{ marginTop: '24px' }}  >
                Requirements
              </h3>
            </div>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              Using Spotivey requires that you have already created an online survey and
              that you have access to the survey administration settings in order to edit the survey's end-URL. <br></br>
              We recommend to use Spotivey together with LimeSurvey.
              However, most other online survey applications should work, too.
            </Typography>
            <h3 className="settings-subtitle-text" style={{ marginTop: '24px' }}  >
              Technical structure of Spotivey
            </h3>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              Spotivey, like the LimeSurvey survey system, runs in any internet browser,
              both on desktop PCs and mobile devices.
              As shown in Fig. 1, Spotivey is can be framed by two online questionnaires
              without any interruption in the user experience.
              This framework allows respondents to implement music data retrieval at any point in an online survey,
              rather than always at the end.
              {/* It also allows referencing individually retrieved data in questionnaire
              sections that follow the music data retrieval. */}
              A unique respondent ID is passed from Limesurvey to Spotivey and back to Limesurvey via an URL parameter,
              so that each music transaction record can later be reliably linked to both questionnaire records.
            </Typography>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              There is a dyanmic data protection notice before the music data retrieval, which informs respondents about the specific music data that will be retrieved and stored.
              This is important for legal and ethical reasons, as the retrieval of music data from streaming accounts can be considered a form of data donation for research purposes,
              which requires informed consent from the respondents. Optionally, researchers can require participants to explicitly confirm all individual
              music transaction data records (e.g. individual titles, artists or playlists) directly after retrieval
              with regard to a specific question that can be formulated freely. This is genreally recommended, as it allows respondents to exclude data stemming from other people using the same account
              and to adhere to data protection guidelines. There also is a general confirmation function which allows respondents to confirm all retrieved data at once, if they do not want to confirm
              each individual data record separately.
            </Typography>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              Spotivey does never store or retrieve the name, email address or date of birth of participants, even if we need to briefly access the Spotify profile for technical reasons.
            </Typography>
            <figure class='overview-img'>
              <img src="../../../static/images/imagesTutorial/Abb1.svg" width='100%' />
              {/* TODO: Update image */}
              <figcaption class='figcaption-text'>
                Fig. 1: Practical functional structure of the Spotivey application
              </figcaption>
            </figure>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              The functionality of the Spotivey app can be divided into two parts:
              The <i>users' area</i>, which is the area that researchers use to plan the study as well as manage and
              retrieve the results, and the <i>participant flow</i>, which is the area that is visible to respondents
              in the browser and allows them to donate their digital music usage data to the researchers
              as part of the online survey.
            </Typography>
          </div>
          <div id='retrieval-settings-tutorial'>
            <div className='settings-overview-title'>
              <h2 className="tutorial-content-title">
                Retrieval-Settings
              </h2>
            </div>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              For conducting a study, researchers need to create a Settings Profile that links to an existing initial Limesurvey
              questionnairevia the Limesurvey questionnaire ID. The Settings Profile can be created and edited in the users' area of Spotivey in the "Settings" tab.
              The initial questionnaire should be designed in such a way that participants are informed on
              the start page that the study will retrieve survey data as well as music data from the music
              streaming user account and, in accordance with the European General Data Protection Regulation,
              also include the necessary general data protection notice on the purposes and storage of the data.
              Furthermore, the following link must be set in Limesurvey as the end URL of the questionnaire:
            </Typography>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              https://spotivey.users.ak.tu-berlin.de/?surveyID=&#123;SID&#125;&participant=&#123;SAVEDID&#125;&lang=&#123;LANG&#125;
            </Typography>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              This ensures that users are automatically redirected to the Spotivey App after completing the input questionnaire
              and that all necessary information
              (study ID, respondent ID and survey language) is passed through to the Spotivey App (and
              to a potential follow-up questionnaire).
            </Typography>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              When creating (or updating) a Settings profile, researchers will be asked to provide a name and an ID for the settings profile. <span style={{ fontWeight: 'bold' }}>The ID must be identical to the questionnaire ID of the initial Limesurvey questionnaire.</span>
              There can not be two settings profiles with the same ID, as the ID is used to link the settings profile to the corresponding questionnaire.
            </Typography>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              Now, users can set what kind of data the Spotivey app should retrieve from
              the Spotify profiles of the survey participants (see next section for more details).
              As soon as a settings profile has been created,
              the online survey study with integrated music data retrieval can be activated. The confirmation text for a survey can be set for German and English language via the edit confirmation text button in the settings tab.
              Please note, that no changes to the settings profile (including confirmation texts) can be made while there are no participant records for the corresponding study.
              If there are already participant records, they need to be deleted (on the results page), before the settings profile can be updated.
            </Typography>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              In principle, Spotivey itself can handle multiple active settings profiles at the same time and manage
              multiple users. Users will only see and manage their own settings profiles and the corresponding results.
            </Typography>
          </div>
          <div id='spotify-information-tutorial'>
            <div className='settings-overview-title'>
              <h2 className="tutorial-content-title">
                Spotify data that can be retrieved
              </h2>
            </div>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              The following data can be retrieved from the Spotify API with Spotivey:
              <ul className='tutorial-list'>
                {listItem.map((item, index) => {
                  return (
                    <React.Fragment>
                      <div className='tutorial-list-item-container' onClick={(e) => handleCollapseClicked(e, index)}>
                        <li className='tutorial-list-item'>
                          {item}
                        </li>
                        <div className={'tutorial-list-collapse-icon'}>
                          {collapseOpen[index] ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
                        </div>
                      </div>
                      {collapseOpen[index] ?
                        <div className={'tutorial-list-collapse-item'}>
                          {renderCollapseItem(index)}
                        </div> :
                        null}
                    </React.Fragment>
                  )
                })}
              </ul>
            </Typography>
          </div>
          <div id='end-settings-tutorial'>
            <div className='settings-overview-title'>
              <h2 className="tutorial-content-title">
                End-Settings
              </h2>
            </div>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              There are different options for the end of the data donation process, which can be set in the end-settings for a specific settings profile.
              The options are:
              <ul className='tutorial-list'>
                <li className='tutorial-list-item'>
                  Plain end page: After the data donation process, participants are shown a plain end page with a thank you message.
                </li>
                <li className='tutorial-list-item'>
                  Summary end page: After the data donation process, participants are shown a dynamic summary of the data they have donated.
                </li>
                <li className='tutorial-list-item'>
                  End-URL: After the data donation process, participants are redirected to a URL that can be freely defined by the researcher. All URL-parameters that were passed to Spotivey (including the participant ID and the survey language) are passed through to this URL, so that they can be used for further processing (e.g. in a follow-up questionnaire).
                </li>
                <li className='tutorial-list-item'>
                  Conditional Redirect: Depending on wether a specific URL-parameter was passed to Spotivey or not (e.g., an id from a panel provider), participants are either redirected to a freely definable URL or shown a plain end page or summary-style end page. The name of the conditional parameter can be chosen freely.
                </li>
              </ul>
              In addition, researchers can set wether participants should have the option to submit an email adress, e.g. for a lottery. Researhers can also set a custom text that is displayed when asking for the email address.
            </Typography>
          </div>
          <div id='screenout-settings-tutorial'>
            <div className='settings-overview-title'>
              <h2 className="tutorial-content-title">
                Screenout-Settings
              </h2>
            </div>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              Researchers can also set screenout options for participants who either do not want to donate their music data or do not meet a certain threshold for the total number of music data records retrieved (can be set by the researcher). In the case of screenout, participants are either shown a plain end page with an option to restart the donation process or are redirected to a freely definable URL (e.g., to a screenout page from a panel provider). As with the end-settings, all URL-parameters that were passed to Spotivey (including the participant ID and the survey language) are passed through to the screenout URL, so that they can be used for further processing. Also, redirecting can be made conditional on the presence of a specific URL-parameter, as described above for the end-settings.
            </Typography>
            {/* <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              If researchers want to directly ask questions about the retrieved music data (such as titles or artists)
              in the follow-up questionnaire, Spotivey supports this with additional functions:
              On the one hand, the researcher can set in Spotivey how many and which types of music
              transaction data records should be directly included in the follow-up questionnaire.
              These are then also forwarded to Limesurvey as parameters via the URL, so that this
              information can be accessed in the form of variables when programming the follow-up questionnaire.
            </Typography> */}
            {/* <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              In order to ease this not-so-simple creation of questions with reference to the retrieved music,
              Spotivey also creates automatically pre-programmed LimeSurvey questions on request,
              either of the single question type or of the matrix question type.
              These then directly read out the variable contents configured for transmission and write
              them into the question text, either in the form of text modules, or even in the form of a
              small web player that makes the respective titles playable again and visually presents the
              cover of the respective music release.
              These prefabricated questions can then be exported from Spotivey in the form of an XML question group file,
              imported into the LimeSurvey follow-up questionnaire and then adapted,
              redesigned and extended with regard to the specific needs of the respective survey (see fig. 4 right).
            </Typography> */}
          </div>
          <div id='results-tutorial'>
            <div className='settings-overview-title'>
              <h2 className="tutorial-content-title">
                Results Page
              </h2>
            </div>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              On the Results Page of the backend, researchers can get an overview of the collected data donations for their Settings Profiles, delete them (e.g. after a pretest). Researchers can also download the collected data, divided into two different tables: One table contains information on the level of participants (e.g. country, subscription level, number of followers), while the other table contains the participants' listening repertoire with information on the level of individual Spotify items (e.g. track title, artist name, playlist title).
            </Typography>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              Both tables can be downloaded as CSV files. The downloaded data can subsequently be joined with survey data from the initial questionnaire and the follow-up questionnaire (if applicable) via the participant ID. If applicable, there is also a third table with the collected email addresses of participants, which are not linked to the participant ID, but can be downloaded for conducting, e.g., a lottery.
            </Typography>
          </div>
          <div id='testphase-tutorial'>
            <div className='settings-overview-title'>
              <h2 className="tutorial-content-title">
                Test and field phase
              </h2>
            </div>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              As soon as at least the initial questionnaire has been built in LimeSurvey and the corresponding Settings Profile has been configured in Spotivey, researchers can conduct first test trials. For this, the <span style={{ fontWeight: 'bold' }}>initial questionnaire must be activated in Limesurvey</span> so that all necessary parameters are forwarded to Spotivey (in test mode, Limesurvey does not transmit URL parameters). If applicable, the follow-up questionnaires in Limesurvey must also be activated, if they are supposed to be tested. The results generated in such test runs can be easily deleted after the test phase via the user profile on the results page using a button. After a successful test phase, researchers can start field phase, typically by deactivating both questionnaires once in Limesurvey and activating them again, which also deletes the survey data accumulated there during testing.
            </Typography>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              For the field phase, it should be noted that the Spotify API is accessed by the Spotivey app via a so-called developer account, which is subject to a rate limit. It is currently unclear, how many data donations can be collected within a certain time frame before the rate limit is reached, which would lead to a temporary failure of the data retrieval. Please therefore be mindful about the number of data donations you collect within a short time frame and contact us if you have any questions regarding this issue.
            </Typography>
          </div>
          <div id='study-participants-tutorial'>
            <div className='settings-overview-title'>
              <h2 className="tutorial-content-title">
                Spotivey workflow from the perspective of study participants
              </h2>
            </div>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              To avoid dropouts and to ensure a smooth user experience, please make sure to inform potential study participants about the process of music data retrieval in a transparent way before they start the survey. In particular, participants should be aware that:
              <ul className='tutorial-list'>
                <li className='tutorial-list-item'>
                  A personal Spotify account is a mandatory prerequisite for study participation.
                </li>
                <li className='tutorial-list-item'>
                  In addition to the survey, the study will also include retrieval of certain information from the participants personal Spotify account.
                </li>
                <li className='tutorial-list-item'>
                  Participants might have to enter their Spotify login credentials in the course of the survey to authorise the data retrieval process.
                </li>
              </ul>

              It is also recommended to inform participants about the approximate duration of the survey and the data retrieval process, as this can help to reduce dropouts. Further, we advise to add a note regarding the redirection about to happen to the end of the initial questionnaire (e.g., "You will now be automatically redirected to a new page, where you can donate your music data to our research project.").
            </Typography>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              If the same particant ID is passed to Spotivey multiple times, the retrieval process will overwrite existing results for the respective participant ID.
            </Typography>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              Now a screen with the Spotivey logo appears and, with the help of a permanently programmed text in the respective survey language, respondents are informed transparently in the sense of informed consent about which specific data are to be retrieved from their own Spotify account right now and that this data will later be merged with the rest of the questionnaire data - in the sense transparency, the app displays a list of exactly those retrieval options that were set by the study operators.
            </Typography>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              The respondents are then asked to authorise the process using their Spotify login. The data retrieval from the Spotify account then begins, which typically takes a few seconds and is therefore visualised with a small and detailed animation and accompanied by the request not to close the browser window. At this moment, only the data to which consent was explicitly given in the course of the data protection notice is retrieved; in particular, no personal data from the account is saved, although this would be technically possible.
            </Typography>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              If this has been configured accordingly in the Retrieval Profile, the respondents are now given the opportunity to confirm each individual music record retrieved from their Spotify account with regard to a question previously configured by the study participants. They can also confirm all retrieved data at once, if they do not want to confirm each individual data record separately. Records rejected during this process are now immediately deleted from the Spotivey database again, so that researchers do not have access to them at any time.
            </Typography>
            <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              After the confirmation process, the data donation process is completed and the participants are either shown a plain end page with a thank you message, a dynamic summary of the data they have donated or redirected to a freely definable URL (e.g. to a follow-up questionnaire), depending on the end-settings configured by the researchers. If configured, participants can also enter their email address for a lottery or other purposes. In this case, the email addresses are stored separately from the music data and the participant ID, so that they can not be linked to the participant ID and the music data later on.
            </Typography>
            {/* <Typography variant="body1" className='settings-overview-text' sx={{ color: 'var(--color-black)' }}>
              The follow-up questions can refer to the retrieved music data in different ways.
              On the one hand, it is possible to refer to individual data fields such as title, artist,
              music label, etc., but on the other hand, a small web player can also be integrated that
              displays the same information but additionally offers the option to briefly play the respective
              title again. Furthermore, the references can be made either in individual questions, so that a
              single question is asked for each data set (e.g. artist) (cf. Figure 11), or in the form of
              so-called matrix questions, in which the same question is asked for a larger number of data sets
              (e.g. music titles) (cf. Figure 12). The further design of the follow-up questionnaire is up
              to the person conducting the survey. However, we recommend that at the end of the survey,
              a note is given again that the consent given to store and analyse all donated music and
              questionnaire data can be revoked at any time by notifying the study operator, which then leads to
              data deletion accordingly.
            </Typography> */}
          </div>
          <div id='references-tutorial'>
            <div className='settings-overview-title'>
              <h2 className="tutorial-content-title">
                References
              </h2>
              <Typography variant="body1" className='settings-overview-literatur-item' sx={{ color: 'var(--color-black)' }}>
                Greenberg, D. M., &amp; Rentfrow, P. J. (2017). Music and big data: A new frontier. Current Opinion in
                Behavioral Sciences, 18, 50–56. <a href='https://doi.org/10.1016/j.cobeha.2017.07.007' target={'_blank'}>
                  https://doi.org/10.1016/j.cobeha.2017.07.007
                </a>
              </Typography>
              <Typography variant="body1" className='settings-overview-literatur-item' sx={{ color: 'var(--color-black)' }}>
                Lepa, S., Steffens, J., Herzog, M., &amp; Egermann, H. (2020). Popular Music as Entertainment
                Communication: How Perceived Semantic Expression Explains Liking of Previously Unknown Music.
                Media and Communication, 8(3), 191–204. <a href='https://doi.org/10.17645/mac.v8i3.3153' target={'_blank'}>
                  https://doi.org/10.17645/mac.v8i3.3153
                </a>
              </Typography>
            </div>
          </div>
        </div>
      </React.Fragment >
    )
  }

  return (
    <React.Fragment>
      <Header />
      <Box className="tutorial-page-shell">
        <Container maxWidth="lg">
          <Paper className="tutorial-page-card" elevation={2}>
            <Box className="tutorial-page-header">
              <Box className="tutorial-page-brand">
                <Typography variant="h3" component="h1" className="tutorial-page-title">
                  Introduction and Tutorial
                </Typography>
              </Box>
            </Box>
            <div className="tutorial-content-container">
              <div>
                <TutorialContentNav />
              </div>
              <div>
                {TutorialContent()}
              </div>
            </div>
          </Paper>
        </Container>
      </Box>
    </React.Fragment>

  )
}