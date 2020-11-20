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
import {LANG_TYPE} from "../../../react/features/translator-moderator/LanguageContext";

const LanguageVolumeControl = ({isLang, lang, langType, onVolumeChange}) => {

    useEffect(() => {
        alert('lang processing')
        if (isLang) {
            const value = (lang === langType) ? 1 : 0;
            onVolumeChange && onVolumeChange(value)
        } else {
            const value = (LANG_TYPE.OPEN === langType) ? 1 : 0;
            onVolumeChange && onVolumeChange(value)
        }
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
            isLang,
            lang,
            langType,
            onVolumeChange
        } = this.props;

        return (
            <LanguageVolumeControl lang={lang} langType={langType}
                                   isLang={isLang}
                                   onVolumeChange={onVolumeChange}/>
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
        lang: LANG_TYPE[name],
        langType: getLang(state) || LANG_TYPE.OPEN
    };
}

export default connect(_mapStateToProps)(LanguageModeratorControl);
