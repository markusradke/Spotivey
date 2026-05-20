import React, { useState, useContext } from "react";
import { useNavigate } from "react-router";
import {
    AppBar,
    Toolbar,
    Menu,
    MenuItem,
    IconButton,
    Button,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Box,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { logoutUser } from "../../../api/surveyApi";
import { ParticipantContext } from "../../../context/ParticipantContext";

export default function Header() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { participant } = useContext(ParticipantContext);

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);

    // Don't render header for participants
    if (participant) {
        return null;
    }

    const navigationItems = [
        { label: "Tutorial", path: "/user/tutorial" },
        { label: "Settings", path: "/user/settings" },
        { label: "Results", path: "/user/results" },
    ];

    const userMenuItems = [
        { label: "Profile", onClick: () => handleProfileClick() },
        { label: "Privacy Center", onClick: () => handlePrivacyClick() },
        { label: "About", onClick: () => handleAboutClick() },
        { label: "Logout", onClick: () => handleLogout() },
    ];

    const handleNavigate = (path) => {
        navigate(path);
        setMobileMenuOpen(false);
    };

    const handleProfileClick = () => {
        setUserMenuAnchor(null);
        navigate("/user/profile");
    };

    const handlePrivacyClick = () => {
        setUserMenuAnchor(null);
        navigate("/privacy");
    };

    const handleAboutClick = () => {
        setUserMenuAnchor(null);
        navigate("/version");
    };

    const handleLogout = () => {
        setUserMenuAnchor(null);
        logoutUser().then(() => {
            navigate("/login");
        });
    };

    const handleUserMenuOpen = (event) => {
        setUserMenuAnchor(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchor(null);
    };

    // Desktop header
    if (!isMobile) {
        return (
            <AppBar
                position="fixed"
                sx={{
                    backgroundColor: "var(--color-secondary)",
                    color: "var(--color-black)",
                    boxShadow: "none",
                    borderBottom: "1px solid var(--border-color-secondary)",
                    zIndex: 1000,
                }}
            >
                <Toolbar
                    sx={{
                        height: "100px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0 15px",
                    }}
                >
                    {/* Logo */}
                    <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                        <img
                            src="../../../static/images/SpotiveyLogo2_Schrift.svg"
                            alt="Spotivey"
                            style={{ height: "60px", width: "auto" }}
                            onClick={() => navigate("/user")}
                        />
                    </Box>

                    {/* Navigation */}
                    <Box sx={{ display: "flex", gap: 0 }}>
                        {navigationItems.map((item) => (
                            <Button
                                key={item.label}
                                color="inherit"
                                onClick={() => handleNavigate(item.path)}
                                sx={{
                                    fontSize: "20px",
                                    fontWeight: 900,
                                    padding: "28px 17px",
                                    textDecoration: "none",
                                    "&:hover": {
                                        color: "var(--color-tu-berlin)",
                                    },
                                }}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </Box>

                    {/* User Menu */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton
                            onClick={handleUserMenuOpen}
                            color="inherit"
                            sx={{
                                "&:hover": {
                                    color: "var(--color-tu-berlin)",
                                },
                            }}
                        >
                            <AccountCircleIcon />
                        </IconButton>
                        <Menu
                            anchorEl={userMenuAnchor}
                            open={Boolean(userMenuAnchor)}
                            onClose={handleUserMenuClose}
                        >
                            {userMenuItems.map((item) => (
                                <MenuItem key={item.label} onClick={item.onClick}>
                                    {item.label}
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
        );
    }

    // Mobile header with hamburger menu
    return (
        <>
            <AppBar
                position="fixed"
                sx={{
                    backgroundColor: "var(--color-secondary)",
                    color: "var(--color-black)",
                    boxShadow: "none",
                    borderBottom: "1px solid var(--border-color-secondary)",
                    zIndex: 1000,
                }}
            >
                <Toolbar
                    sx={{
                        height: "60px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0 16px",
                    }}
                >
                    {/* Logo */}
                    <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                        <img
                            src="../../../static/images/SpotiveyLogo2_Schrift.svg"
                            alt="Spotivey"
                            style={{ height: "40px", width: "auto" }}
                            onClick={() => navigate("/user")}
                        />
                    </Box>

                    {/* Hamburger & User Menu */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                            onClick={handleUserMenuOpen}
                            color="inherit"
                            sx={{
                                "&:hover": {
                                    color: "var(--color-tu-berlin)",
                                },
                            }}
                        >
                            <AccountCircleIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => setMobileMenuOpen(true)}
                            color="inherit"
                            sx={{
                                "&:hover": {
                                    color: "var(--color-tu-berlin)",
                                },
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>

                    {/* User Menu */}
                    <Menu
                        anchorEl={userMenuAnchor}
                        open={Boolean(userMenuAnchor)}
                        onClose={handleUserMenuClose}
                    >
                        {userMenuItems.map((item) => (
                            <MenuItem key={item.label} onClick={item.onClick}>
                                {item.label}
                            </MenuItem>
                        ))}
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Mobile Navigation Drawer */}
            <Drawer
                anchor="right"
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            >
                <Box
                    sx={{
                        width: 250,
                        backgroundColor: "var(--color-secondary)",
                        height: "100%",
                    }}
                >
                    <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
                        <IconButton onClick={() => setMobileMenuOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <List>
                        {navigationItems.map((item) => (
                            <ListItem key={item.label} disablePadding>
                                <ListItemButton
                                    onClick={() => handleNavigate(item.path)}
                                    sx={{
                                        "&:hover": {
                                            color: "var(--color-tu-berlin)",
                                        },
                                    }}
                                >
                                    <ListItemText
                                        primary={item.label}
                                        sx={{ fontWeight: 900, fontSize: "16px" }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
        </>
    );
}
