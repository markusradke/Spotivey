import * as React from "react";
import { useNavigate } from "react-router";
import { useState } from 'react';
import { Typography, Avatar, TextField, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import { createSettingsUser, checkUsernameAvailability, checkEmailAvailability } from "../../api/surveyApi";
import FooterLinks from "../Footer/FooterLinks";

export default function SignUpPage() {
    const [vorname, setVorname] = useState('');
    const [nachname, setNachname] = useState('');
    const [username, setUsername] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [institution, setInstitution] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    function handleSignUpButtonPressed() {
        createSettingsUser({
            first_name: vorname,
            last_name: nachname,
            username: username,
            email: emailAddress,
            institution: institution,
            password: password,
        }).then(({ ok, data }) => {
            if (!ok || !data) {
                setErrors(data?.errors || {});
                return;
            }
            navigate('/login');
        });
    }

    async function handleUsernameBlur() {
        if (username.trim()) {
            const { data } = await checkUsernameAvailability(username);
            if (data && !data.available) {
                setErrors({ ...errors, username: 'This username already exists' });
            }
        }
    }

    async function handleEmailBlur() {
        if (emailAddress.trim()) {
            const { data } = await checkEmailAvailability(emailAddress);
            if (data && !data.available) {
                setErrors({ ...errors, email: 'This email address is already in use' });
            }
        }
    }

    const getFieldError = (field) => errors[field] || '';

    return (
        <React.Fragment>
            <div className="setting-header">
                <header className="setting-header-inner">
                    <div className="setting-header-content-container">
                        <div className="setting-header-content-container-inner">
                            <div className="logo-header">
                                <img src="../../../static/images/SpotiveyLogo2_Schrift.svg" width="100%" height="100%" />
                            </div>
                        </div>
                    </div>
                </header>
            </div>
            <div className='setting-page-main'>
                <div className="login-container-outer">
                    <div className={'login-container'}>
                        <div className={'login-container-inner'}>
                            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                                <PersonAddAltOutlinedIcon />
                            </Avatar>
                            <Typography component="h1" variant="h5">
                                Sign up
                            </Typography>
                            <div className={'login-container-textfield-container'}>
                                <div className={'signup-container-name-container'}>
                                    <div className={"signup-container-name-container-textfield"}>
                                        <TextField
                                            autoComplete="given-name"
                                            name="firstName"
                                            required
                                            fullWidth
                                            id="firstName"
                                            label="First Name"
                                            autoFocus
                                            error={!!getFieldError('first_name')}
                                            helperText={getFieldError('first_name')}
                                            onChange={(e) => {
                                                setVorname(e.target.value);
                                                setErrors({ ...errors, first_name: '' });
                                            }}
                                        />
                                    </div>
                                    <div className={"signup-container-name-container-textfield"}>
                                        <TextField
                                            required
                                            fullWidth
                                            id="lastName"
                                            label="Last Name"
                                            name="lastName"
                                            autoComplete="family-name"
                                            error={!!getFieldError('last_name')}
                                            helperText={getFieldError('last_name')}
                                            onChange={(e) => {
                                                setNachname(e.target.value);
                                                setErrors({ ...errors, last_name: '' });
                                            }}
                                        />
                                    </div>
                                </div>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="username"
                                    label="Username"
                                    name="username"
                                    autoComplete="username"
                                    error={!!getFieldError('username')}
                                    helperText={getFieldError('username')}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        setErrors({ ...errors, username: '' });
                                    }}
                                    onBlur={handleUsernameBlur}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    error={!!getFieldError('email')}
                                    helperText={getFieldError('email')}
                                    onChange={(e) => {
                                        setEmailAddress(e.target.value);
                                        setErrors({ ...errors, email: '' });
                                    }}
                                    onBlur={handleEmailBlur}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                    error={!!getFieldError('password')}
                                    helperText={getFieldError('password')}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setErrors({ ...errors, password: '' });
                                    }}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="institution"
                                    label="Institution"
                                    id="institution"
                                    error={!!getFieldError('institution')}
                                    helperText={getFieldError('institution')}
                                    onChange={(e) => {
                                        setInstitution(e.target.value);
                                        setErrors({ ...errors, institution: '' });
                                    }}
                                />
                                <Button
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                    onClick={handleSignUpButtonPressed}
                                >
                                    Sign Up
                                </Button>
                                <div className={'already-account-container'}>
                                    <Link to="/login" variant="body2" className="already-account">
                                        Already have an account? Sign in
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <FooterLinks variant="default" />
        </React.Fragment>
    );
}