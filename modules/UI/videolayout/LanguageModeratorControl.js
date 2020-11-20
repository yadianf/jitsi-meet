// import React, {useEffect} from 'react'
// import {useLanguage} from "../../../react/features/contexts/LanguageContext";
//
// const LanguageVolumeControl = ({IamTranslator, language, onVolumeChange}) => {
//     const {langType} = useLanguage();
//     useEffect(() => {
//         alert('part' + langType)
//         if (IamTranslator) {
//             const value = (language === langType) ? 1 : 0;
//             alert('part' + value)
//             // onVolumeChange((language === langType) ? 100 : 0)
//         }
//     }, [langType, IamTranslator, language])
//
//     return (
//         <div>
//             control
//         </div>
//     );
//
// }
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

import React, {Component} from 'react';
import {
    getLocalParticipant,
    getParticipantById
} from "../../../react/features/base/participants";
import {connect} from "../../../react/features/base/redux";

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
            participant
        } = this.props;
        return (
            <div>
                <span>test</span>
                <pre>{JSON.stringify(participant, null, 2)}</pre>
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

    return {
        participant
    };
}

export default connect(_mapStateToProps)(LanguageModeratorControl);
