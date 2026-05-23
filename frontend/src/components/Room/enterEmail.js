import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { saveEmail, markParticipantEmailSaved, checkParticipantEmailDisplay } from "../../api/sessionApi";
import { fetchSurveySettingsById } from "../../api/surveyApi";

export default function EnterEmail({ surveyID, participant, language }) {
    const [isCollectEmail, setIsCollectEmail] = useState(false);
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [emailText, setEmailText] = useState();
    const [isChecking, setIsChecking] = useState(true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const saveResponse = await saveEmail({ email, surveyID, participant });
        if (!saveResponse.ok) {
            return;
        }

        const flagResponse = await markParticipantEmailSaved({ surveyID, participant });
        if (!flagResponse.ok) {
            return;
        }

        setSubmitted(true);
    };

    useEffect(() => {
        let isMounted = true;

        async function loadEmailState() {
            if (!surveyID) {
                if (isMounted) {
                    setIsChecking(false);
                }
                return;
            }

            try {
                const [displayResponse, settingsResponse] = await Promise.all([
                    checkParticipantEmailDisplay(participant, surveyID),
                    fetchSurveySettingsById(surveyID),
                ]);

                const endSettings = settingsResponse.data?.[0]?.end_options;

                if (!isMounted) {
                    return;
                }

                setIsCollectEmail(Boolean(displayResponse.showEmailField));
                setEmailText(language === "de" ? endSettings?.email_text_de : endSettings?.email_text_en);
            } catch {
                if (isMounted) {
                    setIsCollectEmail(false);
                }
            } finally {
                if (isMounted) {
                    setIsChecking(false);
                }
            }
        }

        loadEmailState();

        return () => {
            isMounted = false;
        };
    }, [language, participant, surveyID]);

    if (isChecking) {
        return null;
    }

    if (!isCollectEmail) {
        return null;
    }

    return (
        <Box>
            <Box sx={{ mt: 1 }}>
                {emailText && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        {emailText}
                    </Typography>
                )}
                {!submitted ? (
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
                ) : (
                    <Typography variant="body2">
                        {language === 'de' ? 'E-Mail erfolgreich gespeichert!' : 'Email saved successfully!'}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}