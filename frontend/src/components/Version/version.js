import React from "react";
import { Box, Container, IconButton, Paper, Typography } from "@mui/material";
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { useNavigate } from "react-router-dom";

export default function Version() {
    const navigate = useNavigate()


    return (
        <Box className="version-page-shell">
            <Container maxWidth="md">
                <Paper className="version-page-card" elevation={2}>
                    <Box className="version-page-header">
                        <Box className="version-page-brand">
                            <Box
                                component="img"
                                src="../../../static/images/SpotiveyLogo2_Schrift.svg"
                                alt="Spotivey"
                                className="version-page-logo"
                            />
                            <Box>
                                <Typography variant="h5" component="h1" className="version-page-title">
                                    Application Info
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton
                            variant="text"
                            aria-label="Go back"
                            onClick={() => {
                                navigate(-1)
                            }}
                        >
                            <KeyboardBackspaceIcon />
                        </IconButton>
                    </Box>

                    <Box className="version-page-content">
                        <Typography variant="body1" component="p" className="version-page-text">
                            Version: 1.1 (2026)
                        </Typography>
                        <Typography variant="body1" component="p" className="version-page-text">
                            Spotivey was originally developed as part of a master thesis in audio communication by Matthias Ladleif using Django (backend) and React (frontend). The thesis was supervised by Dr. Steffen Lepa and Prof. Stefan Weinzierl at Audio Communication Group, Technische Universität Berlin, Germany.
                        </Typography>
                        <Typography variant="body1" component="p" className="version-page-text">
                            Spotivey was then further developed and extended by Markus Radke during the course of his PhD studies as member of the Audio Communication Group.
                        </Typography>
                        <Typography variant="body1" component="p" className="version-page-text">
                            Spotivey is hosted on a TU Berlin server as a public service free of charge for researchers interested in music research.
                            If you are drawing on Spotivey in your own research, <span style={{ fontWeight: 'bold' }}>please don't forget to cite the original authors as follows:</span>
                        </Typography>
                        <Box className="cite-version">
                            <Typography variant="body2" component="p" className="version-page-citation">
                                Radke, M., Lepa, S., &amp; Ladleif, M. (2023). Spotivey: A web application for simplified use of the Spotify application programming interface in online questionnaire studies. <i>Mobile Media &amp; Communication</i>, 20501579231220857. <a href='https://doi.org/10.1177/20501579231220857' target="_blank" rel="noreferrer">https://doi.org/10.1177/20501579231220857</a>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}