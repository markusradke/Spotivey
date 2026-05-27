import React from "react";
import { Box, Container, IconButton, Paper, Typography } from "@mui/material";
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { useNavigate } from "react-router-dom";
import VersionDescription from "./VersionDescription";

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
                        <VersionDescription />
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}