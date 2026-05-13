import * as React from "react";
import { useState, useEffect, useRef } from 'react';
import { Button, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { CSVLink } from "react-csv";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import { useNavigate } from "react-router-dom";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {
    deleteOnlyResults,
    fetchUserSession,
    saveRepertoireToCsvFile,
    saveParticipantsToCsvFile,
} from "../../../api/surveyApi";

export default function ResultContent(props) {

    const chartRef = useRef(null);

    const [repertoireFileData, setRepertoireFileData] = useState(null);
    const [participantsFileData, setParticipantsFileData] = useState(null);

    const [listEntriesShow, setListEntriesShow] = useState([false, false, false, false, false, false, false]);

    const [currentPage, setCurrentPage] = useState(1);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const dataLimit = 100
    const [pages, setPages] = useState(0)

    const navigate = useNavigate()

    function handleCloseDialog() {
        setOpenDeleteDialog(false);
    }

    const handleDataFetch = async () => {
        saveRepertoireToCsvFile(props.surveyID)
            .then(({ ok, data }) => {
                if (ok && data && !data.error) {
                    if (data.length !== 0) {
                        setRepertoireFileData(data)
                    }
                }
            });
        saveParticipantsToCsvFile(props.surveyID)
            .then(({ ok, data }) => {
                if (ok && data && !data.error) {
                    if (data.length !== 0) {
                        setParticipantsFileData(data)
                    }
                }
            });

    };

    useEffect(() => {
        async function getParticipantSession() {
            fetchUserSession().then(({ ok, data }) => {
                if (!ok || !data || data.username === null) {
                    navigate('/login')
                }
            });
        }
        getParticipantSession();
        handleDataFetch();
    }, [])

    function renderBackButton() {
        return (
            <div className={'back-button-result'}>
                <IconButton
                    onClick={() => {
                        props.setFirstPage(true)
                        setListEntriesShow(listEntriesShow.fill(false))
                    }}
                >
                    <ArrowBackIosNewIcon />
                </IconButton>
            </div>
        )
    }

    function renderTable(data, type, index) {
        let pageLimit = 5

        let dataString = index === 0 ? 'savedTracksData' : index === 1 ? 'topTracksData' : 'recentlyTracksData'

        function goToNextPage() {
            setCurrentPage((page) => page + 1);
        }

        function goToPreviousPage() {
            setCurrentPage((page) => page - 1);
        }

        function goToLastPage() {
            setCurrentPage(pages);
        }

        function goToFirstPage() {
            setCurrentPage(1);
        }

        function changePage(event) {
            const pageNumber = Number(event.target.textContent);
            setCurrentPage(pageNumber);
        }

        const getPaginatedData = () => {
            const startIndex = currentPage * dataLimit - dataLimit;
            const endIndex = startIndex + dataLimit;
            return data.slice(startIndex, endIndex);
        };

        const getPaginationGroup = () => {
            let start = Math.floor((currentPage - 1) / pageLimit) * pageLimit;
            if (currentPage >= 4) {
                start = currentPage - 3
            }
            if (pages - start < pageLimit) {
                start = pages - pageLimit
            }
            if (pages < pageLimit) {
                pageLimit = pages
            }
            if (start < 0) {
                start = 0
            }

            return new Array(pageLimit).fill().map((_, idx) => start + idx + 1);
        };

        function renderPagination() {
            return (
                <div className="pagination">
                    <IconButton
                        size="small"
                        onClick={goToFirstPage}
                        className={`prev ${currentPage === 1 ? 'disabled' : ''}`}
                    >
                        <FirstPageIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={goToPreviousPage}
                        className={`prev ${currentPage === 1 ? 'disabled' : ''}`}
                    >
                        <ArrowBackIosNewIcon fontSize="inherit" />
                    </IconButton>
                    {getPaginationGroup().map((item, index) => (
                        <button
                            key={index}
                            onClick={changePage}
                            className={`paginationItem ${currentPage === item ? 'active' : null}`}
                        >
                            <span>{item}</span>
                        </button>
                    ))}
                    <IconButton
                        size="small"
                        onClick={goToNextPage}
                        className={`next ${currentPage === pages ? 'disabled' : ''}`}
                    >
                        <ArrowForwardIosIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={goToLastPage}
                        className={`prev ${currentPage === pages ? 'disabled' : ''}`}
                    >
                        <LastPageIcon fontSize="inherit" />
                    </IconButton>
                </div>
            )
        }

        return (
            <React.Fragment>
                {renderPagination()}
                <table id={'tableResultParticipant'}>
                    <tr>
                        <th>Participant ID</th>
                        <th>No</th>
                        {type !== 'Profile' ?
                            <React.Fragment>
                                <th>Cover</th>
                                {type === 'Tracks' ? <th>Title</th> : null}
                                {type === 'Artists' ? <th>Title</th> : null}
                                {type === 'Playlists' ? <th>Title</th> : null}
                                {type === 'Tracks' ? <th>Artists Name</th> : null}
                                {type === 'Episodes' ? <th>Name</th> : null}
                                {type === 'Episodes' ? <th>Show</th> : null}
                                {type === 'Shows' ? <th>Name</th> : null}
                                <th>Spotify ID</th>
                                {type === 'Tracks' ? <th>ISRC</th> : null}
                                {type === 'Artists' ? <th>Type</th> : null}
                                {type === 'Artists' ? <th>Popularity</th> : null}
                                {type === 'Artists' ? <th>Followers Total</th> : null}
                                {type === 'Artists' ? <th>Genres</th> : null}
                                {type === 'Playlists' ? <th>Tracks Total</th> : null}
                                {type === 'Playlists' ? <th>Self Owned?</th> : null}
                                {type === 'Playlists' ? <th>Public?</th> : null}
                                {type === 'Playlists' ? <th>Collaborative?</th> : null}
                            </React.Fragment> :
                            <React.Fragment>
                                <th>Country</th>
                                <th>Followers Total</th>
                                <th>Product</th>
                            </React.Fragment>
                        }
                    </tr>
                    {getPaginatedData().map((item, index) => {
                        let idTableRow = (getPaginatedData()[index + 1]?.participant[0] !== getPaginatedData()[index].participant[0] &&
                            getPaginatedData()[index + 1]?.participant[0]) ?
                            'divider-table' : 'no-divider'
                        return (
                            <tr id={idTableRow}>
                                <td>{item.participant}</td>
                                <td>{item.no}</td>
                                {type !== 'Profile' ?
                                    <React.Fragment>
                                        <td>
                                            <img className={'img-table'} src={type === 'Playlists' ? item.cover : item.cover} alt=""></img>
                                        </td>
                                        {type === 'Tracks' ? <td>{item.trackName}</td> : null}
                                        {type === 'Artists' ? <td>{item.artistName}</td> : null}
                                        {type === 'Playlists' ? <td>{item.playlist_name}</td> : null}
                                        {type === 'Shows' ? <td>{item.show_name}</td> : null}
                                        {type === 'Episodes' ? <td>{item.name}</td> : null}
                                        {type === 'Episodes' ? <td>{item.show_name}</td> : null}
                                        {type === 'Tracks' ? <td>{item.spotify_artist_string}</td> : null}
                                        <td>{item.spotify_id}</td>
                                        {type === 'Tracks' ? <td>{item.isrc}</td> : null}
                                        {type === 'Artists' ? <td>{item.type}</td> : null}
                                        {type === 'Artists' ? <td>{item.popularity}</td> : null}
                                        {type === 'Artists' ? <td>{item.followers}</td> : null}
                                        {type === 'Artists' ? <td>{item.genre_string}</td> : null}
                                        {type === 'Playlists' ? <td>{item.n_tracks}</td> : null}
                                        {type === 'Playlists' ? <td>{item.is_self_owned ? <CheckBoxIcon /> : <NotInterestedIcon />}</td> : null}
                                        {type === 'Playlists' ? <td>{item.is_public ? <CheckBoxIcon /> : <NotInterestedIcon />}</td> : null}
                                        {type === 'Playlists' ? <td>{item.is_collaborative ? <CheckBoxIcon /> : <NotInterestedIcon />}</td> : null}
                                    </React.Fragment> :
                                    <React.Fragment>
                                        <td>
                                            {item.country && item.country.trim() ? (
                                                <img className={'img-table'} src={`https://flagcdn.com/w20/${item.country.toLowerCase()}.png`}></img>)
                                                : <span>-</span>
                                            }
                                        </td>
                                        <td>{item.followers}</td>
                                        <td>{item.product}</td>
                                    </React.Fragment>}
                            </tr>
                        )
                    })}
                </table>
                {renderPagination()}
            </React.Fragment>
        )
    }

    function renderListEntriesData(data, title, resultCount, participantCount, type, index) {
        return (
            <div>
                {renderBackButton()}
                <h1 data-heading='true' class='settings-title'>
                    Results - {title}
                </h1>
                <h1 className="user-result-headline-subtitle">
                    Survey: {props.surveyName} <br></br>
                    ID: {props.surveyID}
                </h1>
                <h2>
                    {resultCount} results from {participantCount} participants
                </h2>
                <div className={'saved-tracks-dashboard-outer'}>
                    {type === 'Tracks' ? renderTable(data, 'Tracks', index)
                        : type === 'Artists' ? renderTable(data, 'Artists', index)
                            : type === 'Playlists' ? renderTable(data, 'Playlists', index)
                                : type === 'Shows' ? renderTable(data, 'Shows', index)
                                    : type === 'Episodes' ? renderTable(data, 'Episodes', index)
                                        : renderTable(data, 'Profile', index)}
                </div>
            </div>
        )
    }

    function renderResultsCard(title) {
        return (
            <React.Fragment>
                <h1 data-heading='true' class='result-card-title'>
                    {title}
                </h1>
            </React.Fragment>
        )
    }

    function clickListEntryCard(dataType) {
        props.setFirstPage(false)
        const index = props.data.dataTypes.indexOf(dataType)
        let items = [...listEntriesShow]
        items[index] = true
        setListEntriesShow(items)
        setPages(Math.ceil(dataType.data.length / 100))
    }

    function deleteResults(surveyID) {
        deleteOnlyResults(surveyID).then(() => {
            location.reload();
        });
    }

    return (
        <React.Fragment>
            <div className='buttons-result-wrapper'>
                {repertoireFileData || participantsFileData ?
                    <div className={'button-result-user-container'}>
                        {repertoireFileData ?
                            <CSVLink
                                className={'csv-link-export-file'}
                                data={repertoireFileData}
                                filename={"Spotivey_Repertoire_" + props.surveyID + ".csv"}
                                target="_blank"
                                separator={";"}
                            >
                                <div className={'button-csv-inner-container'}>
                                    <div className={'button-csv-title'}>
                                        Repertoire CSV
                                    </div>
                                    <div className={'button-csv-icon'}>
                                        <FileDownloadIcon />
                                    </div>
                                </div>
                            </CSVLink> : null}
                        {participantsFileData ?
                            <CSVLink
                                className={'csv-link-export-file'}
                                data={participantsFileData}
                                filename={"Spotivey_Participants_" + props.surveyID + ".csv"}
                                target="_blank"
                                separator={";"}
                            >
                                <div className={'button-csv-inner-container'}>
                                    <div className={'button-csv-title'}>
                                        Participants CSV
                                    </div>
                                    <div className={'button-csv-icon'}>
                                        <FileDownloadIcon />
                                    </div>
                                </div>
                            </CSVLink> : null}
                        <Button style={{ color: '#414141' }}
                            onClick={() => { setOpenDeleteDialog(true) }}
                            variant={'text'}
                            startIcon={<DeleteOutlinedIcon />}
                        >
                            Delete All Results
                        </Button>
                    </div> : null
                }
            </div>
            {props.firstPage ?
                <div className={'render-result-card-container'}>
                    {props.data.dataTypes?.map((dataType, index) => {
                        return (
                            <React.Fragment key={index}>
                                {dataType.hasData ?
                                    <div
                                        className={'render-result-card'}
                                        onClick={() => {
                                            clickListEntryCard(dataType)
                                        }}
                                    >
                                        {renderResultsCard(dataType.title)}
                                    </div> : null}
                            </React.Fragment>
                        )
                    })}
                </div> :
                <div>
                    {(() => {
                        const activeIndex = listEntriesShow.indexOf(true)
                        const activeDataType = props.data.dataTypes[activeIndex]
                        return renderListEntriesData(
                            activeDataType.data.sort((a, b) => parseFloat(a.id) - parseFloat(b.id)),
                            activeDataType.title,
                            activeDataType.resultCount,
                            activeDataType.participantCount,
                            activeDataType.type,
                            activeIndex
                        )
                    })()}
                </div>
            }
            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDialog}
            >
                <DialogTitle>
                    {"Delete Results?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you really want to delete all results for the survey with ID {props.surveyID}?
                        All results will be removed and you will not be able to get them back.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={handleCloseDialog}>Disagree</Button>
                    <Button onClick={() => { deleteResults(props.surveyID) }} style={{ color: '#414141' }}>
                        Agree
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment >
    )
}