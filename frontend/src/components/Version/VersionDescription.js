import React from "react";
import { Box, Typography } from "@mui/material";

export default function VersionDescription() {
    return (
        <React.Fragment>
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
        </React.Fragment>
    )
}