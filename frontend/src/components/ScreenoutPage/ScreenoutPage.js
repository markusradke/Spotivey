import React, { useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Container, Paper, Typography, Button } from "@mui/material";

export default function ScreenoutPage() {
    const [searchParams] = useSearchParams();

    const lang = searchParams.get("lang");
    const surveyID = searchParams.get("surveyID");
    const participant = searchParams.get("participant");

    const retryURL = useMemo(() => {
        const params = new URLSearchParams(searchParams.toString());
        return `/?${params.toString()}`;
    }, [searchParams]);

    const heading = lang === 'de' ? 'Leider erfüllen Sie nicht die Voraussetzungen, um an dieser Studie teilzunehmen.' : 'Sorry, you do not meet the requirements to participate in this study.';
    const bodyText = lang === 'de'
        ? 'Um an der Befragung teilzunehmen, müssen Sie der Datenabfrage Ihres Spotify-Accounts zustimmen und mindestens eine bestimmte Menge an Daten bereitstellen. Leider erfüllen Sie diese Voraussetzungen nicht. Sie können außerdem nur einmal mit dem gleichen Spotify-Account teilnehmen. Sollten Sie Daten gespendet haben, werden diese von nicht von uns gespeichert. Wir danken Ihnen trotzdem für Ihr Interesse an unserer Studie! Sollte Ihnen ein Fehler unterlaufen sein, können Sie die Datenspende mit durch einen Klick auf den Knopf "Erneut versuchen" neu starten.'
        : 'To participate in the survey, you must agree to the data retrieval of your Spotify account and provide at least a certain amount of data. Unfortunately, you do not meet these requirements. Also, you can only participate once with the same Spotify account. If you have donated data, it will not be stored by us. We still thank you for your interest in our study! If you made a mistake, you can restart the data donation by clicking on the "Try Again" button.';

    return (
        <div style={{ backgroundColor: 'var(--main-bg-color)', }}>
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
                            {heading}
                        </Typography>
                    </Box>

                    <Typography variant="body1" sx={{ mb: 2, color: 'var(--color-black)' }}>
                        {bodyText}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                        <Button variant="contained" color="primary" onClick={() => window.location.assign(retryURL)}>
                            {lang === 'de' ? 'Erneut versuchen' : 'Try Again'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </div>
    );
}