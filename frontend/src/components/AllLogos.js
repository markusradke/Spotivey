import React from "react";

export default function AllLogos() {
    return (
        <div className="logo-header">
            <div style={{ margin: "25px auto 0 auto", textAlign: "center" }}>
                <span className="logo-tu-berlin">
                    <a href='https://www.ak.tu-berlin.de/menue/fachgebiet_audiokommunikation' target={'_blank'}>
                        <img src="../../static/images/TU-Berlin-Logo.svg" width="81.816" height="60" />
                        <img src="../../static/images/logo_grau-schwarz.png" width="61.812" height="60" />
                    </a>
                </span>
                <br />
                <br />
                <img src="../../../static/images/SpotiveyLogo2_Schrift.svg" width="100%" height="60" />
            </div>
        </div>
    );
}