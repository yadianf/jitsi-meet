import React, {memo, useEffect} from 'react'
import React, {memo, useEffect} from 'prop'
import {useLanguage} from "../../../react/features/contexts/LanguageContext";

const LanguageModeratorControl = ({IamTranslator, language, onVolumeChange}) => {
    const {langType} = useLanguage();
    useEffect(() => {
        if (IamTranslator) {
            alert((language === langType) ? 100 : 0)
            onVolumeChange((language === langType) ? 100 : 0)
        }
    }, [langType, IamTranslator, language])

    return (
        <div>
            control
        </div>
    );

}

export default memo(LanguageModeratorControl);
