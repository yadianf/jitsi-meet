import React from 'react'
import {En, Es, Fr, Room} from "../../../base/icons/svg";
import ToolbarButton from "./ToolbarButton";
import {useTranslation} from 'react-i18next';
import {LANG_TYPE} from "../../../translator-moderator/LanguageContext";
import {connect} from "../../../base/redux";
import {changeLang} from "../../../base/participants";

const logger = Logger.getLogger(__filename);

const LangToolBar = ({langType, useES, useEN, useFR, useOPEN}) => {
    const {t} = useTranslation('languages');

    return (
        <div>
            <pre>{JSON.stringify(langType, null, 2)}</pre>
            <ToolbarButton
                accessibilityLabel=
                    {t('es')}
                icon={Es}
                onClick={(useES)}
                toggled={langType === LANG_TYPE.ES}
                tooltip={t('es')}/>
            <ToolbarButton
                accessibilityLabel=
                    {t('en')}
                icon={En}
                onClick={useEN}
                toggled={langType === LANG_TYPE.EN}
                tooltip={t('en')}/>
            <ToolbarButton
                accessibilityLabel=
                    {t('fr')}
                icon={Fr}
                onClick={useFR}
                toggled={langType === LANG_TYPE.FR}
                tooltip={t('fr')}/>
            <ToolbarButton
                accessibilityLabel=
                    {'Abierto'}
                toggled={langType === LANG_TYPE.OPEN}
                icon={Room}
                onClick={useOPEN}
                tooltip={'Abierto'}/>
        </div>
    );

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
    // Only the local participant won't have id for the time when the conference is not yet joined.
    const {lang} = state;
    logger.info(`render lanTool`, state);
    return {
        langType: lang || LANG_TYPE.OPEN
    };
}

export default connect(_mapStateToProps, _mapDispatchToProps)(LangToolBar);
