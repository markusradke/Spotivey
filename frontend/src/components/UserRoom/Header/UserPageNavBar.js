import * as React from "react";

export function UserPageNavBar() {

    return (
        <nav className="navbar-settings-content">
            <ul class="navbar-setting-item">
                <li class="navbar-settings-list-item">
                    <a className='navbar-settings-list-link' href='/user/tutorial'>
                        Tutorial
                    </a>
                </li>
                <li class="navbar-settings-list-item">
                    <a className='navbar-settings-list-link' href='/user/settings'>
                        Settings
                    </a>
                </li>

                <li class="navbar-settings-list-item">
                    <a className='navbar-settings-list-link' href='/user/results'>
                        Results
                    </a>
                </li>
            </ul>
        </nav>
    )
}