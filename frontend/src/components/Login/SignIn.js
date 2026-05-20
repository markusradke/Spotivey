import React, { Component, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from "react-router-dom";
import { loginSettingsUser } from "../../api/surveyApi";
import FooterLinks from "../Footer/FooterLinks";
import AllLogos from "../AllLogos";

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate();

  const [errorUsername, setErrorUsername] = useState(false)
  const [errorPW, setErrorPW] = useState(false)

  const [helperTextUsername, setHelperTextUsername] = useState("")
  const [helperTextPW, setHelperTextPW] = useState("")

  const handlePassword = (e) => {
    setPassword(e.target.value)
  }

  const handleEmailAddress = (e) => {
    setEmail(e.target.value)
  }

  function handleLoginButtonPressed() {
    loginSettingsUser({
      email: email,
      password: password,
    }).then(({ ok, data }) => {
      if (!ok || !data) {
        return;
      }
      if (data.errors && Object.keys(data.errors).length > 0) {
        setErrorPW(true)
        setHelperTextPW(data.errors.password || "Invalid credentials")
        return;
      }
      navigate("/user");
    });
  }

  const renderLoginPage = () => {
    return (
      <React.Fragment>
        <div className="login-container-outer">
          <div className={'login-container'}>
            <div className={'login-container-inner'}>
              <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Login
              </Typography>
              <div className={'login-container-textfield-container'}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Username or Email Address"
                  name="email"
                  autoComplete="username or email"
                  autoFocus
                  onChange={handleEmailAddress}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleLoginButtonPressed()
                    }
                  }}
                  error={errorUsername}
                  helperText={errorUsername ? helperTextUsername : null}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  onChange={handlePassword}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleLoginButtonPressed()
                    }
                  }}
                  error={errorPW}
                  helperText={errorPW ? helperTextPW : null}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  onClick={handleLoginButtonPressed}
                >
                  Sign In
                </Button>
                <div className={'password-forgot-container'}>
                  <Link to="/sign-up" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </div>
                <div className={'password-forgot-container'} style={{ marginTop: '8px' }}>
                  <Link to="mailto:marc.voigt@tu-berlin.de" variant="body2">
                    {"Forgot password? Contact the administrator."}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <AllLogos />
      <div class='setting-page-main'>
        {renderLoginPage()}
      </div>
      <FooterLinks variant="default" />
    </React.Fragment>
  );
}