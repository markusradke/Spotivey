import * as React from "react";
import TextFieldMain from "./Components/TextFieldMain";
import { Typography, Select, MenuItem, TextField } from "@mui/material";
import { BoundedNumberField } from "./Components/BoundedNumberField";


export function mainContentSettings(
  surveyName, setSurveyName,
  surveyID, setSurveyID,
  surveyIDError, surveyIDChecking,
  screenoutOption, setScreenoutOption,
  screenoutURL, setScreenoutURL,
  conditionalScreenoutURLParameter, setConditionalScreenoutURLParameter,
  screenoutMinData, setScreenoutMinData
) {

  const trimmed_end_url = String(screenoutURL ?? "").trim();
  const trimmed_conditional_parameter = String(
    conditionalScreenoutURLParameter ?? ""
  ).trim();
  const end_url_required =
    screenoutOption === "end_url" || screenoutOption === "conditional_end_url";
  const conditional_parameter_required =
    screenoutOption === "conditional_end_url";
  const end_url_missing = end_url_required && trimmed_end_url === "";
  const conditional_parameter_missing =
    conditional_parameter_required && trimmed_conditional_parameter === "";

  function renderTooltipName() {
    return (
      <div className='tooltip-render-container'>
        <body1 className='tooltip-render-text'>
          Give a representative name of your choice. This expression serves as a recognition feature for several similar survey settings.
        </body1>
      </div>
    )
  }

  function renderTooltipID() {
    return (
      <div className='tooltip-render-container'>
        <body1 className='tooltip-render-text'>
          Please enter the unique ID of your survey.
          If you have already saved a setting with this ID, you can update and change it in your account.
        </body1>
      </div>
    )
  }

  return (
    <React.Fragment>
      <div className="main-content-card">
        {TextFieldMain('Name of Setting', 'Name Survey', setSurveyName, surveyName, true, false, renderTooltipName())}
        {TextFieldMain('1st Survey ID', '1st Survey ID', setSurveyID, surveyID, true, false, renderTooltipID(), false, surveyIDError, surveyIDChecking)}
      </div>
      <div
        className="follow-up-settings-container"
        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
      >
        <h2
          className="follow-up-settings-title"
          style={{ marginTop: '1.5rem' }}
        >
          Screenout Option
        </h2>
        <Typography className='figcaption-text' style={{ marginTop: '0.75rem' }}>
          You can also specify screenout settings, i.e., what happens if a participant does not meet the requirements to take part in the survey (because they do not give consent to share their Spotify data or have donated to few data points).
        </Typography>
        <Select
          value={screenoutOption}
          onChange={(e) => setScreenoutOption(e.target.value)}
          width="50%"
        >
          <MenuItem value="page">Plain Message with Retry Button</MenuItem>
          <MenuItem value="end_url">Redirect to URL</MenuItem>
          <MenuItem value="conditional_end_url">Conditional Redirect to URL</MenuItem>
        </Select>
      </div>
      <div>
        <h3 className="follow-up-settings-title" style={{ marginTop: '0.75rem' }}>
          Minimum Data Requirement for Participation
        </h3>
        <Typography variant="body1" style={{ marginTop: '0.75rem' }}>
          Specify the minimum number of Spotify data points (e.g., songs, playlists) that participants must contribute to take part in the survey. Participants who do not meet this requirement will be screened out according to the selected screenout option. If set to 0, there will be no minimum data requirement for participation.
        </Typography>
        <div style={{ marginTop: '0.75rem' }}>
          <BoundedNumberField
            label="Minimum Data Points"
            value={screenoutMinData}
            onChange={setScreenoutMinData}
            min={0}
            max={1000}
            step={1}
          />
        </div>
      </div>

      {screenoutOption === "end_url" || screenoutOption === "conditional_end_url" ? (
        <div
          className="end-url-input-container"
          style={{ marginTop: '0.75rem' }}
        >
          <TextField
            label="End URL"
            type="url"
            value={screenoutURL}
            onChange={(e) => setScreenoutURL(e.target.value)}
            placeholder="https://example.com"
            fullWidth
            required={end_url_required}
            error={end_url_missing}
            helperText={
              end_url_missing
                ? "End URL is required for this option."
                : ""
            }
          />

          {screenoutOption === "conditional_end_url" && (
            <div style={{ marginTop: '1rem' }}>
              <TextField
                label="Single URL Parameter that triggers conditional redirect"
                type="text"
                value={conditionalScreenoutURLParameter}
                onChange={(e) => setConditionalScreenoutURLParameter(e.target.value)}
                placeholder="e.g., 'panelprovider_id'"
                fullWidth
                style={{ marginTop: '0.75rem' }}
                required={conditional_parameter_required}
                error={conditional_parameter_missing}
                helperText={
                  conditional_parameter_missing
                    ? "This field is required for conditional redirect."
                    : ""
                }
              />
            </div>
          )}
        </div>
      ) : null}
    </React.Fragment>
  );
}