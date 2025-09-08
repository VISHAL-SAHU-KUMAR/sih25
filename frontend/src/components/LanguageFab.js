import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageFab.css';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
];

export default function LanguageFab() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleLanguageMenu = () => {
    setIsOpen(!isOpen);
  };

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="language-fab-container">
      {/* Language options menu */}
      {isOpen && (
        <div className="language-options">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
              title={lang.name}
            >
              <span className="language-flag">{lang.flag}</span>
              <span className="language-name">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Main FAB button */}
      <button
        onClick={toggleLanguageMenu}
        className="language-fab"
        title="Change Language"
      >
        <span className="current-language-flag">{currentLanguage.flag}</span>
        <span className="fab-icon">{isOpen ? '✕' : '🌐'}</span>
      </button>
    </div>
  );
}