import React from 'react'
import {En, Es, Fr, Room} from "../../../base/icons/svg";
import ToolbarButton from "./ToolbarButton";
import {useTranslation} from 'react-i18next';
import {
    LANG_TYPE,
    useLanguage
} from "../../../translator-moderator/LanguageContext";


const LangToolBar = () => {
    const {t} = useTranslation('languages');
    const {langType, useEN, useES, useFR, useOPEN} = useLanguage()

    return (
        <div>
            <ToolbarButton
                accessibilityLabel=
                    {t('es')}
                icon={Es}
                onClick={useES}
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

export default LangToolBar;
