import React from "react";
import { Box, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function FooterLinks(props) {
    const navigate = useNavigate();
    const { variant = "default" } = props;

    const handlePrivacyClick = () => {
        navigate("/privacy");
    };

    const handleAboutClick = () => {
        navigate("/version");
    };

    // Default variant: footer at bottom of page
    if (variant === "default") {
        return (
            <Box
                sx={{
                    backgroundColor: "var(--color-secondary)",
                    padding: "16px 15px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    boxSizing: "border-box",
                }}
            >
                <Box sx={{ display: "flex", gap: 3 }}>
                    <Link
                        onClick={handlePrivacyClick}
                        sx={{
                            color: "var(--main-bg-color)",
                            textDecoration: "none",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            "&:hover": {
                                color: "var(--color-tu-berlin)",
                            },
                        }}
                    >
                        Privacy Center
                    </Link>
                    <Link
                        onClick={handleAboutClick}
                        sx={{
                            color: "var(--main-bg-color)",
                            textDecoration: "none",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            "&:hover": {
                                color: "var(--color-tu-berlin)",
                            },
                        }}
                    >
                        About
                    </Link>
                </Box>
                <Box
                    sx={{
                        fontSize: "12px",
                        color: "var(--main-bg-color)",
                        marginLeft: "auto",
                        paddingRight: 0,
                    }}
                >
                    © 2026 Spotivey v1.1
                </Box>
            </Box>
        );
    }

    // Minimal variant: for inline use in headers/menus
    return (
        <Box sx={{ display: "flex", gap: 2, fontSize: "12px" }}>
            <Link
                onClick={handlePrivacyClick}
                sx={{
                    color: "inherit",
                    textDecoration: "none",
                    cursor: "pointer",
                    "&:hover": {
                        color: "var(--color-tu-berlin)",
                    },
                }}
            >
                Privacy
            </Link>
            <Link
                onClick={handleAboutClick}
                sx={{
                    color: "inherit",
                    textDecoration: "none",
                    cursor: "pointer",
                    "&:hover": {
                        color: "var(--color-tu-berlin)",
                    },
                }}
            >
                About
            </Link>
        </Box>
    );
}
