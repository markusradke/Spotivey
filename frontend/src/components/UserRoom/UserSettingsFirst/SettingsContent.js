import * as React from "react";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import {Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { columns } from './DataGridColumns.js';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router";
import Tooltip from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import ManageHistoryOutlinedIcon from '@mui/icons-material/ManageHistoryOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TextFieldsIcon from '@mui/icons-material/TextFields';

export default function SettingsContent(props) {

    const [settingsRows, setSettingsRows] = useState(null)
    const [selectedRowSettings, setSelectedRowSettings] = useState([])

    const [openTooltipCopy, setOpenTooltipCopy] = React.useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteDialogMessage, setDeleteDialogMessage] = useState('');
    const [participantCount, setParticipantCount] = useState(0);
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    const [updateDialogMessage, setUpdateDialogMessage] = useState('');


    const navigate = useNavigate()

    useEffect(() => {
        if(props.username){
            fetch("/api/get-settingslist" + "?username=" + props.username).then(response => response.json())
            .then((data) => {
                if (!data.error){
                    setSettingsRows(data.data)
                }
            });
        }
    }, [])

    function renderSettingsTable() {
        return(
            <div style={{ height: 400, width: '100%' }}>
                {settingsRows?.length !== 0 ?
                    <DataGrid
                        rows={settingsRows}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        checkboxSelection
                        disableSelectionOnClick
                        onSelectionModelChange={(ids) => {
                            const selectedIDs = []
                            settingsRows.forEach((row) =>   
                                ids.forEach(function(item, index){
                                    if(row.id===item){
                                        selectedIDs.push(row)
                                    }
                                    return(selectedIDs)
                                })       
                            );
                            setSelectedRowSettings(selectedIDs)
                        }}
                    /> : 
                    <div className="settings-table-card-container">
                        <h3 class='settings-overview-text'>
                            No settings found
                        </h3>
                    </div>
                }
            </div>
        )
    }

    function checkAndDelete(){
        // Check participant count for all selected settings
        let promises = [];
        for(let zaehler = 0; zaehler<selectedRowSettings.length; zaehler++){
            promises.push(
                fetch("/api/get-participant-count?surveyID=" + encodeURIComponent(selectedRowSettings[zaehler].umfrageID))
                    .then(res => res.json())
            );
        }
        
        Promise.all(promises).then(results => {
            // Sum up all participants and records
            let totalParticipants = 0;
            let totalRecords = 0;
            let hasData = false;
            
            results.forEach(data => {
                if (data.hasData) {
                    hasData = true;
                    totalParticipants += (data.participantCount || 0);
                    totalRecords += (data.totalRecords || 0);
                }
            });
            console.log('Participant count results:', results);
            
            if (hasData) {
                // Show info dialog - cannot delete
                setParticipantCount(totalParticipants);
                setDeleteDialogMessage(
                    `${totalParticipants} participant(s) have contributed ${totalRecords} data record(s). ` +
                    `Please delete the results data first if you wish to remove this survey setting.`
                );
                setOpenDeleteDialog(true);
            } else {
                // No data - delete immediately
                deleteSettings();
            }
        });
    }

    function deleteSettings(){
        let promises = [];
        for(let zaehler = 0; zaehler<selectedRowSettings.length; zaehler++){
            promises.push(fetch("/api/delete-settings" + "?surveyid=" + selectedRowSettings[zaehler].umfrageID));
        }
        Promise.all(promises).then(() => {
            location.reload();
        }).catch(error => {
            console.error('Error deleting settings:', error);
            alert('Error deleting settings. Please try again.');
        });
    }

    function checkAndUpdate(){
        fetch("/api/get-participant-count?surveyID=" + encodeURIComponent(selectedRowSettings[0].umfrageID))
            .then(res => res.json())
            .then(data => {
                if (data.hasData) {
                    setUpdateDialogMessage(
                        `${data.participantCount} participant(s) have contributed ${data.totalRecords} data record(s). ` +
                        `Settings cannot be modified after data collection has started.`
                    );
                    setOpenUpdateDialog(true);
                } else {
                    navigateToUpdatePage();
                }
            })
            .catch(error => {
                console.error('Error checking participant count:', error);
                alert('Error checking participant data. Please try again.');
            });
    }

    function navigateToUpdatePage(){
        navigate('/user/settings/new', {
            state: {
                update: true,
                surveyID: selectedRowSettings[0].umfrageID
            }
       })
    }

    function checkAndUpdateConfirmText(){
        fetch("/api/get-participant-count?surveyID=" + encodeURIComponent(selectedRowSettings[0].umfrageID))
            .then(res => res.json())
            .then(data => {
                if (data.hasData) {
                    setUpdateDialogMessage(
                        `${data.participantCount} participant(s) have contributed ${data.totalRecords} data record(s). ` +
                        `Settings cannot be modified after data collection has started.`
                    );
                    setOpenUpdateDialog(true);
                } else {
                    navigateToConfirmTextPage();
                }
            })
            .catch(error => {
                console.error('Error checking participant count:', error);
                alert('Error checking participant data. Please try again.');
            });
    }

    function navigateToConfirmTextPage(){
        navigate( '/user/settings/confirm-text-design', {
            state: {
                update: true,
                surveyID: selectedRowSettings[0].umfrageID
            }
       })
    }

    function renderDeleteButton(){
        return(
            <div>
                <Button 
                    startIcon={<DeleteOutlinedIcon />}
                    onClick={() => {
                        checkAndDelete()
                    }}
                    disabled={selectedRowSettings.length !== 0 ? false : true}
                >
                    Delete Profile
                </Button>
            </div>
        )
    }

    function renderChangeButton(){
        return(
            <div>
                <Button 
                    startIcon={<ManageHistoryOutlinedIcon />}
                    onClick={() => {checkAndUpdate()}}
                    disabled={selectedRowSettings.length === 1 ? false : true}
                >
                    Edit Profile
                </Button>
            </div>
        )
    }

    const handleTooltipClose = () => {
        setOpenTooltipCopy(false);
    };
    
    const handleTooltipOpen = () => {
        setOpenTooltipCopy(true);
    };

    function getEndUrlSurvey() {
        const url = 'https://spotivey.users.ak.tu-berlin.de/?surveyID={SID}&participant={SAVEDID}&lang={LANG}'
        navigator.clipboard.writeText(url)
        handleTooltipOpen()
    }

    function renderGetEndUrlSurvey() {
        return(
            <div>
                <ClickAwayListener onClickAway={handleTooltipClose}>
                    <div>
                        <Tooltip
                            onClose={handleTooltipClose}
                            open={openTooltipCopy}
                            disableFocusListener
                            disableHoverListener
                            disableTouchListener
                            title="Copy to Clipboard"
                        >
                            <Button 
                                startIcon={<ContentCopyIcon />}
                                onClick={() => {getEndUrlSurvey()}}
                            >
                                Copy End URL for Limesurvey Survey
                            </Button>
                        </Tooltip>
                    </div>
                </ClickAwayListener>
            </div>
        )
    }

    function renderChangeConfirmButton() {
        return(
            <React.Fragment>
                <Button 
                    startIcon={<TextFieldsIcon />}
                    onClick={() => {checkAndUpdateConfirmText()}}
                    disabled={selectedRowSettings.length === 1 ? false : true}
                >
                    Edit Confirmation Text
                </Button>
            </React.Fragment>
        )
    }


    function renderDeleteDialog(){
        return(
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
            >
                <DialogTitle>
                    Cannot Delete Settings
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {deleteDialogMessage}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    function renderUpdateDialog(){
        return(
            <Dialog
                open={openUpdateDialog}
                onClose={() => setOpenUpdateDialog(false)}
            >
                <DialogTitle>
                    Cannot Edit Settings
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {updateDialogMessage}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUpdateDialog(false)} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    return(
    <div>
        <h1 data-heading='true' class='settings-title'>
            Retrieval Settings
        </h1>
        <h3 class='settings-overview-text'>
            In order to create your first profile, press the "New Profile" button. 
            This will redirect you to a new page. There you can create and save a profile.
            <br></br>
            If you want to delete or update an existing profile, 
            check the checkbox of the profile and press the button provided for it.
            <br></br>
            You can edit the text that participants see when they confirm their Spotify data.
            To do this, press the button <i>Edit Confirmation Text</i>.
            <br></br>
            To copy an End-URL for your online survey (which you need for LimeSurvey for example), 
            press the button <i>Copy End URL for Limesurvey Survey</i>.
        </h3>
        <div className="settings-table-button-container-inner" id='copy-end-url'>
            {renderGetEndUrlSurvey()} 
        </div>
        <div className="settings-table-button-container">
            <div className="settings-table-button-container-inner">
                <Button startIcon={<AddOutlinedIcon />} href='settings/new'>
                    New Profile
                </Button>
            </div>
            <div className="settings-table-button-container-inner">
                {renderDeleteButton()}
            </div>
            <div className="settings-table-button-container-inner">
                {renderChangeButton()}
            </div>
            <div className="settings-table-button-container-inner">
                {renderChangeConfirmButton()}
            </div>
        </div>
        {renderSettingsTable()}
        {renderDeleteDialog()}
        {renderUpdateDialog()}
    </div>
    )
}