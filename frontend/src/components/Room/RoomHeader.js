import React from "react";

export default function RoomHeader() {
    return (
        <div className="room-header">
            <header className="room-header-inner">
                <div className="room-header-content-container">
                    <div className="room-header-content-container-inner">
                        <span className="logo-tu-berlin">
                            <img
                                src="../../../static/images/SpotiveyLogo2_Schrift.svg"
                                width="100%"
                                height="100%"
                                alt="Spotivey"
                            />
                        </span>
                    </div>
                </div>
            </header>
        </div>
    );
}
