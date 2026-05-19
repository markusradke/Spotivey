import React from "react";

export default function TutorialContentNav() {
    return (
        <React.Fragment>
            <ul className="tutorial-nav-container">
                <li className="tutorial-nav-list">
                    <a href='#requirements-tutorial' className="tutorial-nav-list-item">
                        {'Requirements'}
                    </a>
                </li>
                <li className="tutorial-nav-list">
                    <a href='#general-tutorial' className="tutorial-nav-list-item">
                        {'General information'}
                    </a>
                </li>
                <li className="tutorial-nav-list">
                    <a href='#retrieval-settings-tutorial' className="tutorial-nav-list-item">
                        {'Retrieval-Settings'}
                    </a>
                </li>
                <li className="tutorial-nav-list">
                    <a href='#spotify-information-tutorial' className="tutorial-nav-list-item">
                        {'Spotify information that can be configured'}
                    </a>
                </li>
                <li className="tutorial-nav-list">
                    <a href='#followup-settings-tutorial' className="tutorial-nav-list-item">
                        {'FollowUp-Settings'}
                    </a>
                </li>
                <li className="tutorial-nav-list">
                    <a href='#results-tutorial' className="tutorial-nav-list-item">
                        {'Results Page'}
                    </a>
                </li>
                <li className="tutorial-nav-list">
                    <a href='#testphase-tutorial' className="tutorial-nav-list-item">
                        {'Test and field phase'}
                    </a>
                </li>
                <li className="tutorial-nav-list">
                    <a href='#study-participants-tutorial' className="tutorial-nav-list-item">
                        {'Spotivey workflow from the perspective of study participants'}
                    </a>
                </li>
            </ul>
        </React.Fragment>
    )
}