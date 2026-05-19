import * as React from "react";
import { Tooltip } from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function LimitComponent(maximum = 50) {
    function tooltipRender() {
        return (
            <div className='tooltip-render-container'>
                <body1 className='tooltip-render-text'>
                    The maximum number of items to return. Default: 20. Minimum: 1. Maximum: {maximum}.
                </body1>
            </div>
        )
    }

    return (
        <React.Fragment>
            <div className='textField-info-container'>
                <h2 class='figcaption-text'>
                    limit
                </h2>
                <Tooltip
                    title={tooltipRender()}
                    placement="top-end"
                    fontSize='small'
                    sx={{
                        marginTop: 'auto',
                        marginBottom: 'auto',
                        marginRight: 'auto',
                        marginLeft: '10px',
                    }}
                >
                    <InfoOutlinedIcon />
                </Tooltip>
            </div>
        </React.Fragment>
    )
}