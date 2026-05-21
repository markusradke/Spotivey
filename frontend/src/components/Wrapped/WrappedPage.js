import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Box, Container, Paper, Typography } from "@mui/material";
import EnterEmail from "../Room/enterEmail";

export default function WrappedPage() {
    let { lang } = useParams();
    const [searchParams] = useSearchParams();
    const surveyID = searchParams.get("surveyID");

    const heading = lang === 'de' ? 'Deine Daten' : 'Your Data';
    const bodyText = lang === 'de'
        ? 'Hier entsteht gerade eine Auswertung Ihrer Daten.'
        : 'An evaluation of your data is being created here.';

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
                        <Typography variant="h5" component="h1" sx={{ color: 'var(--color-tu-berlin)' }}>
                            {heading}
                        </Typography>
                    </Box>

                    <Typography variant="body1" sx={{ mb: 2, color: 'var(--color-black)' }}>
                        {bodyText}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                        <EnterEmail surveyID={surveyID} language={lang} />
                    </Box>
                </Paper>
            </Container>
        </div>
    )
}