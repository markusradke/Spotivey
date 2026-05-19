import * as React from "react";
import { Button, Tooltip } from "@mui/material";
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

export function saveButton(
  setOpenDialog,
  mySwiperActiveIndex, countCheckboxen, changeTextfield, update,
  endOption, endURL, conditionalEndURLParameter
) {

  const getEndSettingsError = () => {
    const trimmedEndURL = (endURL ?? "").trim();
    const trimmedConditionalParameter = (
      conditionalEndURLParameter ?? ""
    ).trim();
    const endUrlRequired =
      endOption === "end_url" || endOption === "conditional_end_url";
    const conditionalParameterRequired = endOption === "conditional_end_url";

    if (endUrlRequired && trimmedEndURL === "") {
      return "End URL is required for this end option.";
    }

    if (conditionalParameterRequired && trimmedConditionalParameter === "") {
      return "Conditional parameter is required for this end option.";
    }

    return "";
  };

  function saveButtonPressed() {
    setOpenDialog(true)
  }

  function renderSaveButton(type) {
    const endSettingsError = getEndSettingsError();
    const baseDisabled = countCheckboxen === 0 || !changeTextfield;
    const disabled = baseDisabled || endSettingsError !== "";
    const tooltipTitle = baseDisabled
      ? countCheckboxen === 0 && !changeTextfield
        ? 'check some Checkboxes and complete Main Settings'
        : countCheckboxen === 0
          ? 'no Checkbox checked'
          : 'main Settings incomplete'
      : endSettingsError;

    return (
      <div class='speicher-button'>
        {disabled ?
          <Tooltip title={tooltipTitle}>
            <span>
              <Button
                variant="contained"
                endIcon={<SaveOutlinedIcon />}
                color='inherit'
                onClick={saveButtonPressed}
                disabled
              >
                {type}
              </Button>
            </span>
          </Tooltip> :
          <Button
            variant="contained"
            endIcon={<SaveOutlinedIcon />}
            color='inherit'
            onClick={saveButtonPressed}
          >
            {type}
          </Button>
        }
      </div>
    )
  }
  return (
    <React.Fragment>
      {update ? renderSaveButton('Update') : renderSaveButton('Save')}
    </React.Fragment>
  )
}