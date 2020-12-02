import React, {memo} from 'react'

const LanIcon = ({lan}) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text xmlns="http://www.w3.org/2000/svg" x="2" y="17"  style="fill:white;font-size:14px;">
                {lan}
            </text>
        </svg>

    );

}

export default memo(LanIcon);
