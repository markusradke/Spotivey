import * as React from "react";
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router";
import { Typography, Avatar, TextField, Button, Box, Alert } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import { getUserProfile, updateUserProfile, checkEmailAvailability } from "../../../api/surveyApi";
import HeaderSettings from "../Header/headerSettings";

export default function UserProfilePage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [currentEmail, setCurrentEmail] = useState('');
    const [email, setEmail] = useState('');
    const [institution, setInstitution] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadUserProfile();
    }, []);

    function loadUserProfile() {
        getUserProfile().then(({ ok, data }) => {
            if (!ok || !data) {
                navigate('/login');
                return;
            }
            setFirstName(data.first_name);
            setLastName(data.last_name);
            setEmail(data.email);
            setCurrentEmail(data.email);
            setInstitution(data.institution);
        });
    }

    async function handleEmailBlur() {
        if (email === currentEmail) {
            return; // No need to check if email hasn't changed
        }
        if (email.trim()) {
            const { data } = await checkEmailAvailability(email);
            if (data && !data.available) {
                setErrors({ ...errors, email: 'This email address is already in use' });
            }
        }
    }

    function handleSaveChanges() {
        const newErrors = {};

        // Validate required fields
        if (!firstName.trim()) {
            newErrors.first_name = 'First name is required';
        }
        if (!lastName.trim()) {
            newErrors.last_name = 'Last name is required';
        }
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/.test(email)) {
            newErrors.email = 'Invalid email address';
        }
        if (!institution.trim()) {
            newErrors.institution = 'Institution is required';
        }

        // Validate password fields if new password is provided
        if (newPassword || confirmPassword || oldPassword) {
            if (!oldPassword.trim()) {
                newErrors.old_password = 'Current password is required to change your password';
            }
            if (!newPassword.trim()) {
                newErrors.new_password = 'New password is required';
            }
            if (!confirmPassword.trim()) {
                newErrors.confirm_password = 'Password confirmation is required';
            }
            if (newPassword && confirmPassword && newPassword !== confirmPassword) {
                newErrors.confirm_password = 'Passwords do not match';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const payload = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            institution: institution,
        };

        if (newPassword) {
            payload.old_password = oldPassword;
            payload.new_password = newPassword;
        }

        updateUserProfile(payload).then(({ ok, data }) => {
            if (!ok) {
                setErrors(data?.errors || {});
                setSuccessMessage('');
                return;
            }
            setErrors({});
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 5000);
        });

        setCurrentEmail(email);
    }

    const getFieldError = (field) => errors[field] || '';

    return (
        <React.Fragment>
            <div class="setting-header">
                <header class="setting-header-inner">
                    <div class="setting-header-content-container">
                        <div class="setting-header-content-container-inner">
                            {HeaderSettings()}
                        </div>
                    </div>
                </header>
            </div>
            <div className='setting-page-main'>
                <div className="login-container-outer">
                    <div className={'login-container'}>
                        <div className={'login-container-inner'}>
                            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                                <PersonIcon />
                            </Avatar>
                            <Typography component="h1" variant="h5">
                                Edit Profile
                            </Typography>
                            {successMessage && (
                                <Alert severity="success" sx={{ mt: 2, mb: 2, width: '100%' }}>
                                    {successMessage}
                                </Alert>
                            )}
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
                                            value={firstName}
                                            error={!!getFieldError('first_name')}
                                            helperText={getFieldError('first_name')}
                                            onChange={(e) => {
                                                setFirstName(e.target.value);
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
                                            value={lastName}
                                            error={!!getFieldError('last_name')}
                                            helperText={getFieldError('last_name')}
                                            onChange={(e) => {
                                                setLastName(e.target.value);
                                                setErrors({ ...errors, last_name: '' });
                                            }}
                                        />
                                    </div>
                                </div>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    value={email}
                                    error={!!getFieldError('email')}
                                    helperText={getFieldError('email')}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErrors({ ...errors, email: '' });
                                    }}
                                    onBlur={handleEmailBlur}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="institution"
                                    label="Institution"
                                    id="institution"
                                    value={institution}
                                    error={!!getFieldError('institution')}
                                    helperText={getFieldError('institution')}
                                    onChange={(e) => {
                                        setInstitution(e.target.value);
                                        setErrors({ ...errors, institution: '' });
                                    }}
                                />
                                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                                    Change Password (Optional)
                                </Typography>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    name="oldPassword"
                                    label="Current Password"
                                    type="password"
                                    id="oldPassword"
                                    autoComplete="current-password"
                                    value={oldPassword}
                                    error={!!getFieldError('old_password')}
                                    helperText={getFieldError('old_password')}
                                    onChange={(e) => {
                                        setOldPassword(e.target.value);
                                        setErrors({ ...errors, old_password: '' });
                                    }}
                                />
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    name="newPassword"
                                    label="New Password"
                                    type="password"
                                    id="newPassword"
                                    autoComplete="new-password"
                                    value={newPassword}
                                    error={!!getFieldError('new_password')}
                                    helperText={getFieldError('new_password')}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        setErrors({ ...errors, new_password: '' });
                                    }}
                                />
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    name="confirmPassword"
                                    label="Confirm New Password"
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    error={!!getFieldError('confirm_password')}
                                    helperText={getFieldError('confirm_password')}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setErrors({ ...errors, confirm_password: '' });
                                    }}
                                />
                                <Button
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                    onClick={handleSaveChanges}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}
