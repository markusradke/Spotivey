import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { saveEmail, checkEmailSubmitted } from "../../api/sessionApi";
import { fetchSurveySettingsById } from "../../api/surveyApi";

export default function EnterEmail({ surveyID, language }) {
    const [isCollectEmail, setIsCollectEmail] = useState(false);
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [emailText, setEmailText] = useState();
    const [isChecking, setIsChecking] = useState(true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await saveEmail({ email, surveyID });
        setSubmitted(true);
    };

    useEffect(() => {
        if (!surveyID) return;

        checkEmailSubmitted().then((response) => {
            const is_submitted = response.submitted;
            if (is_submitted) {
                setSubmitted(true);
            }
            setIsChecking(false);
        }).catch(() => {
            setSubmitted(true); // conservative catch
            setIsChecking(false);
        });
    }, [surveyID]);

    useEffect(() => {
        if (!surveyID) return;

        fetchSurveySettingsById(surveyID).then((response) => {
            if (response.data) {
                const end_settings = response.data[0].end_options;
                if (language === "de") {
                    setEmailText(end_settings.email_text_de);
                } else {
                    setEmailText(end_settings.email_text_en);
                }
                setIsCollectEmail(end_settings.collect_emails);
            };
        })
    }, [language, surveyID]);

    if (isChecking) {
        return null;
    }

    return (
        <Box>
            {isCollectEmail ? (
                !submitted ? (
                    <Box sx={{ mt: 1 }}>
                        {emailText && (
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                {emailText}
                            </Typography>
                        )}
                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                        >
                            <TextField
                                size="small"
                                label={language === 'de' ? 'E-Mail' : 'Email'}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{ backgroundColor: '#fff' }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                size="small"
                                sx={{
                                    backgroundColor: 'var(--color-tu-berlin)',
                                    color: '#fff',
                                    '&:hover': { backgroundColor: 'var(--color-tu-berlin-secondary)' }
                                }}
                            >
                                {language === 'de' ? 'Senden' : 'Submit'}
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Typography variant="body2">
                        {language === 'de' ? 'E-Mail erfolgreich gespeichert!' : 'Email saved successfully!'}
                    </Typography>
                )
            ) : null}
        </Box>
    );
}