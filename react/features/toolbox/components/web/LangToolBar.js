import React, {memo, useState} from 'react'
import {En, Es, Fr} from "../../../base/icons/svg";
import ToolbarButton from "./ToolbarButton";
import { useTranlation } from 'react-i18next';

const LangToolBar = () => {
    const {t} = useTranlation('languages')

    return (
        <>
            <ToolbarButton
            accessibilityLabel =
                { t('es') }
            icon = { Es }
            onClick = { this._onToolbarOpenInvite }
            tooltip = { t('es') } />
            <ToolbarButton
            accessibilityLabel =
                { t('en') }
            icon = { En }
            onClick = { this._onToolbarOpenInvite }
            tooltip = { t('en') } />
            <ToolbarButton
            accessibilityLabel =
                { t('fr') }
            icon = { Fr }
            onClick = { this._onToolbarOpenInvite }
            tooltip = { t('fr') } />
        </>
    );

}

export default memo(LangToolBar);
