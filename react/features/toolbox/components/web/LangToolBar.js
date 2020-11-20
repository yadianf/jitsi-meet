import React, {useState} from 'react'
import {En, Es, Fr, Room} from "../../../base/icons/svg";
import ToolbarButton from "./ToolbarButton";
import {useTranslation} from 'react-i18next';
import {LANG_TYPE} from "../../../translator-moderator/LanguageContext";
import {connect} from "../../../base/redux";
import {changeLang, getLang} from "../../../base/participants";
import Logger from 'jitsi-meet-logger';
import OverflowMenuButton from "./OverflowMenuButton";

const logger = Logger.getLogger(__filename);

const ICON = {
    [LANG_TYPE.OPEN]: Room,
    [LANG_TYPE.FR]: Fr,
    [LANG_TYPE.EN]: En,
    [LANG_TYPE.ES]: Es,
}

const LangToolBar = ({langType, useES, useEN, useFR, useOPEN, isSmallWidth}) => {
    const {t} = useTranslation('languages');
    const [_overflowMenuVisible, _onSetOverflowVisible] = useState(false);

    const overflowMenuContent = [
        <ToolbarButton
            key={'es'}
            accessibilityLabel={t('es')}
            icon={ICON.ES}
            onClick={(useES)}
            toggled={langType === LANG_TYPE.ES}
            tooltip={t('es')}/>,
        <ToolbarButton
            key={'en'}
            accessibilityLabel={t('en')}
            icon={ICON.EN}
            onClick={useEN}
            toggled={langType === LANG_TYPE.EN}
            tooltip={t('en')}/>,
        <ToolbarButton
            key={'fr'}
            accessibilityLabel=
                {t('fr')}
            icon={ICON.FR}
            onClick={useFR}
            toggled={langType === LANG_TYPE.FR}
            tooltip={t('fr')}/>,
        <ToolbarButton
            key={'open'}
            accessibilityLabel=
                {'Abierto'}
            toggled={langType === LANG_TYPE.OPEN}
            icon={ICON.OPEN}
            onClick={useOPEN}
            tooltip={'Abierto'}/>
    ];
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
        },
        useES: () => {
            dispatch(changeLang(LANG_TYPE.ES));
        },
        useEN: () => {
            dispatch(changeLang(LANG_TYPE.EN));
        },
        useFR: () => {
            dispatch(changeLang(LANG_TYPE.FR));
        },
        useOPEN: () => {
            dispatch(changeLang(LANG_TYPE.OPEN));
        },
    };
}

function _mapStateToProps(state) {
    return {
        langType: getLang(state) || LANG_TYPE.OPEN
    };
}

export default connect(_mapStateToProps, _mapDispatchToProps)(LangToolBar);
