import React from "react";
import { Button } from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { logoutUser } from "../../../api/surveyApi";
import { useNavigate } from "react-router";

import { UserPageNavBar } from "./UserPageNavBar";


export default function HeaderSettings(props) {

    const navigate = useNavigate();

    function logoutButtonPressed() {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        };
        logoutUser().then(() => {
            navigate("/login");
        });
    }

    function profileButtonPressed() {
        navigate("/user/profile");
    }

    return (
        <React.Fragment>
            <div className="logo-header">
                <span className="logo-tu-berlin">
                    <a href='https://www.ak.tu-berlin.de/menue/fachgebiet_audiokommunikation' target={'_blank'}>
                        <img src="../../../../static/images/TU-Berlin-Logo.svg" width="81.816" height="60" />
                        <img src="../../../../static/images/logo_grau-schwarz.png" width="61.812" height="60" />
                    </a>
                    <img src="../../../static/images/SpotiveyLogo2_Schrift.svg" width="100%" height="100%" />
                </span>
            </div>
            <div className="navbar-header">
                {UserPageNavBar()}
            </div>
            <div className="header-profile">
                <Button variant="text" endIcon={<AccountCircleIcon />} onClick={profileButtonPressed}>
                    Profile
                </Button>
            </div>
            <div class='header-logout'>
                <Button variant="text" endIcon={<LogoutOutlinedIcon />} onClick={logoutButtonPressed} >
                    Logout
                </Button>
            </div>
        </React.Fragment>
    );
}