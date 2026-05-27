import React from "react";

export default function TutorialContentNav() {
    return (
        <React.Fragment>
            <ul className="tutorial-nav-container">
                <li className="tutorial-nav-list">
                    <a href='#introduction-tutorial' className="tutorial-nav-list-item">
                        {'Introduction'}
                    </a>
                </li>
                <li className="tutorial-nav-list">
                    <a href='#general-tutorial' className="tutorial-nav-list-item">
                        {'Technical setup and requirements'}
                    </a>
                </li>
                <li className="tutorial-nav-list">
                    <a href='#retrieval-settings-tutorial' className="tutorial-nav-list-item">
                        {'Settings Profile'}
                    </a>
                </li>
                <li className="tutorial-nav-list">
                    <a href='#spotify-information-tutorial' className="tutorial-nav-list-item">
                        {'Spotify data that can be retrieved'}
                    </a>
                </li>
                <li className="tutorial-nav-list">
                    <a href='#end-settings-tutorial' className="tutorial-nav-list-item">
                        {'End-Settings'}
                    </a>
                </li>
                <li className="tutorial-nav-list">
                    <a href='#screenout-settings-tutorial' className="tutorial-nav-list-item">
                        {'Screenout-Settings'}
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
                <li className="tutorial-nav-list">
                    <a href='#references-tutorial' className="tutorial-nav-list-item">
                        {'References'}
                    </a>
                </li>
            </ul>
        </React.Fragment>
    )
}