import React, {createContext, useContext, useMemo, useState} from 'react';

const LanguageContext = createContext();

export const LANG_TYPE = {
    OPEN: 'OPEN',
    ES: 'ES',
    EN: 'EN',
    FR: 'FR',
}

function LanguageProvider(props) {
    const [langType, setLangType] = useState(LANG_TYPE.OPEN)

    const {useES, useEN, useFR, useOPEN} = useMemo(() => {
        return {
            useES: () => setLangType(LANG_TYPE.ES),
            useEN: () => {
                setLangType(LANG_TYPE.EN);
                alert("EN")
            },
            useFR: () => setLangType(LANG_TYPE.FR),
            useOPEN: () => setLangType(LANG_TYPE.OPEN),
        }
    }, [])

    return (
        <LanguageContext.Provider value={{
            langType,
            setLangType,
            useES, useEN, useFR, useOPEN
        }}>
            <div className={'lang-provider-custom'}>
                {props.children}
            </div>
        </LanguageContext.Provider>
    );
}

function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    const {
        langType,
        setLangType,
        useES, useEN, useFR, useOPEN
    } = context;

    return {
        langType,
        setLangType,
        useES, useEN, useFR, useOPEN
    };
}

LanguageProvider.propTypes = {};


export {LanguageProvider, useLanguage};
