import React, {memo, useState} from 'react'
import {En, Es, Fr, Room} from "../../../base/icons/svg";
import ToolbarButton from "./ToolbarButton";
import {useTranslation} from 'react-i18next';


const LangToolBar = () => {
    const {t} = useTranslation('languages')

    return (
        <div>
            <ToolbarButton
            accessibilityLabel =
                { t('es') }
            icon = { Es }
            tooltip = { t('es') } />
            <ToolbarButton
            accessibilityLabel =
                { t('en') }
            icon = { En }
            tooltip = { t('en') } />
            <ToolbarButton
            accessibilityLabel =
                { t('fr') }
            icon = { Fr }
            tooltip = { t('fr') } />
            <ToolbarButton
            accessibilityLabel =
                { 'Abierto' }
            icon = { Room }
            tooltip = { 'Abierto' } />
        </div>
    );

}

export default LangToolBar;
