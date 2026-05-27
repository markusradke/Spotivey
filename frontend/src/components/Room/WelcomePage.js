import React from "react";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import { Box, Container, Paper, Typography } from "@mui/material";
import { acceptPrivacyPolicy } from "../../api/surveyApi";

export default function WelcomePage(props) {
    const navigate = useNavigate();

    function renderWelcomeTextGerman() {
        return (
            <Typography variant="body1" className={'endPage-Stepper-body'} sx={{ color: 'var(--color-black)' }}>
                Die Spotivey Applikation der TU Berlin wird im Rahmen einer <span style={{ fontWeight: 700 }}>Datenspende zu Forschungszwecken</span> gemäß der EU-Datenschutz-Grundverordnung (DSGVO) auf Ihr Spotify-Profil zugreifen.
                <br />
                <br />
                Dazu bitten wir Sie nun anschließend, sich bei Spotify einzuloggen.
                Damit erteilen Sie uns explizit <span style={{ fontWeight: 700 }}>Ihre Zustimmung zum  Abruf folgender Accountinformationen</span>:
                <br />
                <br />
                <ol style={{ paddingLeft: '32px' }}>
                    {props.welcomeSettingsDeutschArray.map((item, idx) => (
                        item[0] ? <li key={idx}>{item[1]}</li> : null
                    ))}
                </ol>
                <br />
                Personenbezogene Profildaten wie Name, Profilbild, Emailadresse und Geburtsdatum werden in keinem Fall
                von uns abgerufen, gespeichert, oder analysiert, auch wenn wir aus technischen Gründen
                kurz auf Ihr Spotify-Profil zugreifen müssen, welches diese personenbezogenen Daten enthält.
                <br />
                <br />
                Lediglich die oben aufgelisteten Daten zu Ihrer persönlichen Musiknutzung werden von uns abgerufen
                und anschließend mit Ihren restlichen Fragebogendaten verknüpft.
                Sie werden von den Durchführenden der Studie ausschließlich zu Forschungszwecken unter den
                datenschutzrechtlichen Bedingungen verwendet, denen Sie bereits zu Beginn der Befragung zugestimmt haben.
            </Typography>
        )
    }

    function renderWelcomeTextEnglish() {
        return (
            <Typography variant="body1" className={'endPage-Stepper-body'} sx={{ color: 'var(--color-black)' }}>
                The Spotivey application of TU Berlin will access your Spotify profile as part of a <span style={{ fontWeight: 700 }}>data donation
                    for research purposes</span> in accordance with the EU General Data Protection Regulation (GDPR).
                <br />
                <br />
                For this purpose, we will subsequently ask you to log in to Spotify.
                By doing so, you explicitly give us your <span style={{ fontWeight: 700 }}>consent to retrieve the following account information</span>:
                <br />
                <br />
                <ol style={{ paddingLeft: '32px' }}>
                    {props.welcomeSettingsEnglishArray.map((item, idx) => (
                        item[0] ? <li key={idx}>{item[1]}</li> : null
                    ))}
                </ol>
                <br />
                Personal profile data such as name, profile picture, email address and date of birth are never retrieved,
                stored or analyzed by us, even if we need to briefly access your Spotify profile for technical reasons,
                which contains this personal data.
                <br />
                <br />
                Only the data listed above regarding your personal music usage will be
                retrieved by us and subsequently linked to the rest of your questionnaire data.
                They will be used by those conducting the study exclusively for research purposes under the data
                protection conditions that you already agreed to at the beginning of the survey.
            </Typography>
        )
    }

    function buildParamsString(paramsArray) {
        const params = new URLSearchParams();
        if (Array.isArray(paramsArray)) {
            paramsArray.forEach(([key, value]) => {
                params.append(key, value);
            });
        }
        return params.toString();
    }

    function navigateToScreenout(paramsString) {
        const screenoutOption = props.settings?.screenout_options.option || 'page';

        switch (screenoutOption) {
            case 'end_url': {
                const url = props.settings.screenout_options.screenout_url;
                window.location.href = paramsString
                    ? `${url}?${paramsString}`
                    : url;
                break;
            }
            case 'conditional_end_url': {
                const paramName = props.settings.screenout_options.conditional_screenout_url_parameter;
                const paramExists = Array.isArray(props.paramsObjectSession) &&
                    props.paramsObjectSession.some(([key]) => key === paramName);

                if (paramExists) {
                    const url = props.settings.screenout_options.screenout_url;
                    window.location.href = paramsString
                        ? `${url}?${paramsString}`
                        : url;
                } else {
                    navigate('/screenout?' + paramsString);
                }
                break;
            }
            case 'page':
            default:
                navigate('/screenout?' + paramsString);
                break;
        }
    }

    function handleDeclineParticipation() {
        props.onAcceptStart?.();
        const paramsString = buildParamsString(props.paramsObjectSession);

        acceptPrivacyPolicy({ accepted: false })
            .then(() => {
                props.setWelcomePageOK(false);
                navigateToScreenout(paramsString);
            })
            .catch((error) => {
                console.error("Error declining privacy policy:", error);
                props.onAcceptError?.();
                navigateToScreenout(paramsString);
            });
    }

    return (
        <div style={{ backgroundColor: 'var(--main-bg-color)' }}>
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Paper elevation={2} sx={{ p: 3, backgroundColor: 'var(--main-bg-color)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                            component="img"
                            src="../../../static/images/SpotiveyLogo2_Schrift.svg"
                            alt="Spotivey"
                            sx={{ height: 40, mr: 2 }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" component="h1" sx={{ color: 'var(--color-tu-berlin)' }}>
                            {props.language == 'de' ? 'Datenschutz' : 'Privacy Notice'}
                        </Typography>
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'left' }}>
                        <Button variant={'contained'} onClick={() => {
                            props.onAcceptStart?.();
                            acceptPrivacyPolicy({ accepted: true })
                                .then(() => {
                                    props.setWelcomePageOK(true)
                                })
                                .catch((error) => {
                                    console.error("Error accepting privacy policy:", error);
                                    props.onAcceptError?.();
                                })

                        }}>
                            {props.language == 'de' ? 'Akzeptieren und fortfahren' : 'Accept and continue'}
                        </Button>
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'left' }}>
                        <Button
                            variant={'text'}
                            sx={{ color: '#888' }}
                            onClick={handleDeclineParticipation}>
                            {props.language == 'de' ? 'Ablehnen und Teilnahme abbrechen' : 'Decline and Cancel Participation'}
                        </Button>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        {props.language == 'de' ? renderWelcomeTextGerman() : renderWelcomeTextEnglish()}
                    </Box>

                </Paper>
            </Container>
        </div>
    )
}