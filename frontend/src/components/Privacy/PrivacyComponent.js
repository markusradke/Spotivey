import React from "react";
import { useState, useEffect } from 'react';
import LoginIcon from '@mui/icons-material/Login';
import { Box, Button, Container, IconButton, Paper, Typography } from "@mui/material";
import PrivacyContent from "./PrivacyContent";
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { useNavigate } from "react-router-dom";
import { fetchParticipantSession } from "../../api/surveyApi";

export default function PrivacyComponent() {

    const [getParticipantSessionCheck, setgetParticipantSessionCheck] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        async function getParticipantSession() {
            fetchParticipantSession().then(({ ok, data }) => {
                if (!ok || !data || data.code === null) {
                    setgetParticipantSessionCheck(false)
                } else {
                    setgetParticipantSessionCheck(true)
                }
            });
        }
        getParticipantSession();
    }, [])

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'var(--main-bg-color)', py: { xs: 2, sm: 3, md: 4 } }}>
            <Container maxWidth="lg">
                <Paper
                    elevation={2}
                    sx={{
                        overflow: 'hidden',
                        borderRadius: 4,
                        px: { xs: 2, sm: 3, md: 4 },
                        py: { xs: 2, sm: 3, md: 4 },
                        bgcolor: 'var(--main-bg-color)',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            justifyContent: 'space-between',
                            gap: 2,
                            flexWrap: 'wrap',
                            mb: { xs: 2, md: 3 },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                            <Box
                                component="img"
                                src="../../../static/images/SpotiveyLogo2_Schrift.svg"
                                alt="Spotivey"
                                sx={{ height: { xs: 32, sm: 40 }, width: 'auto', maxWidth: '100%' }}
                            />
                            <Box>
                                <Typography
                                    variant="h5"
                                    component="h1"
                                    sx={{ color: 'var(--color-tu-berlin)', fontWeight: 700, lineHeight: 1.1 }}
                                >
                                    Privacy Center
                                </Typography>
                            </Box>
                        </Box>
                        {getParticipantSessionCheck ?
                            <IconButton
                                variant="text"
                                aria-label="Go back"
                                onClick={() => {
                                    navigate(-1)
                                }}
                                sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
                            >
                                <KeyboardBackspaceIcon />
                            </IconButton> :
                            <Button variant="text" startIcon={<LoginIcon />} href={'/login'}>
                                Login
                            </Button>
                        }
                    </Box>
                    <PrivacyContent />
                </Paper>
            </Container>
        </Box>
    )
}