import React from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Container, Paper, Typography } from "@mui/material";
import EnterEmail from "../Room/enterEmail";

export default function EndPage() {
    const [searchParams] = useSearchParams();
    const lang = searchParams.get("lang");
    const surveyID = searchParams.get("surveyID");
    const participant = searchParams.get("participant");

    const heading = lang === 'de' ? 'Geschafft - Vielen Dank!' : 'Done - Thank you!';
    const bodyText = lang === 'de'
        ? 'Danke für Ihre Datenspende in Form von Informationen zu Ihrem Musikhörverhalten aus Ihrem Spotify-Account! Die Befragung ist an dieser Stelle zu Ende. Sie können dieses Fenster jetzt also schließen.'
        : 'Thank you for donating your data in the form of information about your music listening habits from your Spotify account! The survey ends at this point. So you can close this window now.';

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
                        <Typography variant="h5" component="h1" sx={{ color: 'var(--color-tu-berlin)' }}>
                            {heading}
                        </Typography>
                    </Box>

                    <Typography variant="body1" sx={{ mb: 2, color: 'var(--color-black)' }}>
                        {bodyText}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                        <EnterEmail surveyID={surveyID} participant={participant} language={lang} />
                    </Box>
                </Paper>
            </Container>
        </div>
    );
}