import React, {memo, useEffect} from 'react'
import {useLanguage} from "../../../react/features/contexts/LanguageContext";

const LanguageModeratorControl = ({IamTranslator, language, onVolumeChange}) => {
    const {langType} = useLanguage();
    useEffect(() => {
        alert('part' + langType)
        if (IamTranslator) {
            const value = (language === langType) ? 100 : 0;
            alert('part' + value)
            // onVolumeChange((language === langType) ? 100 : 0)
        }
    }, [langType, IamTranslator, language])

    return (
        <div>
            control
        </div>
    );

}

export default memo(LanguageModeratorControl);
