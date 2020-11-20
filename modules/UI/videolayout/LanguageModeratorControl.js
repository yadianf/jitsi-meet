import React, {useEffect} from 'react'
import {useLanguage} from "../../../react/features/contexts/LanguageContext";

const LanguageVolumeControl = ({IamTranslator, language, onVolumeChange}) => {
    const {langType} = useLanguage();
    useEffect(() => {
        alert('part' + langType)
        if (IamTranslator) {
            const value = (language === langType) ? 1 : 0;
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


class LanguageModeratorControl {
    
    render() {
        return (
            <span>test<LanguageVolumeControl/></span>
        )
    }
}

export default LanguageModeratorControl;
