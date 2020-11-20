// import React, {useEffect} from 'react'
// import {useLanguage} from "../../../react/features/contexts/LanguageContext";
//

//
//
// class LanguageModeratorControl {
//
//     render() {
//         return (
//             <span>test<LanguageVolumeControl/></span>
//         )
//     }
// }
//
// export default LanguageModeratorControl;
/* @flow */

import React, {Component, useEffect} from 'react';
import {
    getLang,
    getLocalParticipant,
    getParticipantById,
    PARTICIPANT_ROLE
} from "../../../react/features/base/participants";
import {connect} from "../../../react/features/base/redux";
import {
    LANG_TYPE
} from "../../../react/features/translator-moderator/LanguageContext";

const LanguageVolumeControl = ({lang,langType, onVolumeChange}) => {

    useEffect(() => {
        const value = (lang === langType) ? 1 : 0;
        alert('lang change for '+ lang + 'now yuo use ' + langType+ ', Volume '+ value);
        onVolumeChange && onVolumeChange(value)
    }, [langType, lang])

    return (
        <div>
            control
        </div>
    );

}

/**
 * React {@code Component} for showing the status bar in a thumbnail.
 *
 * @extends Component
 */
class LanguageModeratorControl extends Component {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            participant,
            isModerator,
            isLang,
            lang,
            langType,
            onVolumeChange
        } = this.props;

        return (
            <div>
                <p>{participant && participant.name}</p>
                <p>{isModerator ? 'moderator' : 'no moderator'}</p>
                {
                    isLang && <LanguageVolumeControl lang={lang} langType={langType}
                                                     onVolumeChange={onVolumeChange}/>
                }
            </div>
        );
    }
}

/**
 * Maps (parts of) the Redux state to the associated {@code StatusIndicators}'s props.
 *
 * @param {Object} state - The Redux state.
 * @param {Object} ownProps - The own props of the component.
 * @private
 * @returns {{
 *     _currentLayout: string,
 *     _showModeratorIndicator: boolean
 * }}
 */
function _mapStateToProps(state, ownProps) {
    const {participantID} = ownProps;

    // Only the local participant won't have id for the time when the conference is not yet joined.
    const participant = participantID ? getParticipantById(state, participantID) : getLocalParticipant(state);
    const name = participant && participant.name;
    const isModerator = participant && participant.role === PARTICIPANT_ROLE.MODERATOR;
    return {
        participant,
        isModerator,
        isLang: isModerator && LANG_TYPE[name],
        lang:LANG_TYPE[name],
        langType: getLang(state) || LANG_TYPE.OPEN
    };
}

export default connect(_mapStateToProps)(LanguageModeratorControl);
