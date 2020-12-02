import React, {useState} from 'react'
import ToolbarButton from "./ToolbarButton";
import {useTranslation} from 'react-i18next';
import {LANG_TYPE} from "../../../translator-moderator/LanguageContext";
import {connect} from "../../../base/redux";
import {changeLang, getLang} from "../../../base/participants";
import Logger from 'jitsi-meet-logger';
import OverflowMenuButton from "./OverflowMenuButton";
import map from "lodash/map";
import {En, Es, Fr, Pt, Room} from "../../../base/icons/svg";

const logger = Logger.getLogger(__filename);

const ICON = {
    [LANG_TYPE.OPEN]: Room,
    [LANG_TYPE.FR]: Fr,
    [LANG_TYPE.EN]: En,
    [LANG_TYPE.ES]: Es,
    [LANG_TYPE.ES]: Es,
    [LANG_TYPE.PT]: Pt,
}
const customName = {
    OPEN: 'Abierto',
    PT: 'ptBR'
}

const LangToolBar = ({langType, onChangeLang, isSmallWidth}) => {
    const {t} = useTranslation('languages');
    const [_overflowMenuVisible, _onSetOverflowVisible] = useState(false);

    const overflowMenuContent = map(LANG_TYPE, (lan) => {
        let name = customName[lan] || lan;

        t(lan.toLocaleString());

        return <ToolbarButton
            key={lan}
            accessibilityLabel={t(lan.toLocaleString())}
            icon={ICON[lan]}
            onClick={() => onChangeLang(LANG_TYPE[lan])}
            toggled={langType === LANG_TYPE[lan]}
            tooltip={t(name)}/>
    })

    if (isSmallWidth)
        return (<OverflowMenuButton
            icon={ICON[langType]}
            hideAccessibility
            isOpen={_overflowMenuVisible}
            onVisibilityChange={_onSetOverflowVisible}>
            <ul
                aria-label={t(langType.toLowerCase())}
                className='overflow-menu'>
                {overflowMenuContent}
            </ul>
        </OverflowMenuButton>)

    return overflowMenuContent;

}

export function _mapDispatchToProps(dispatch: Function): $Shape<Props> {
    return {
        onChangeLang: (lang) => {
            dispatch(changeLang(lang));
        }
    };
}

function _mapStateToProps(state) {
    return {
        langType: getLang(state) || LANG_TYPE.OPEN
    };
}

export default connect(_mapStateToProps, _mapDispatchToProps)(LangToolBar);
