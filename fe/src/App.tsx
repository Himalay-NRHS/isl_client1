import { useState } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { Navbar } from './components/Navbar'
import { ConverterView } from './components/ConverterView'
import { LearnView } from './components/LearnView'
import type { Mode, Language } from './types'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState<'converter' | 'learn'>('converter')
  const [mode, setMode] = useState<Mode>('text-to-sign')
  const [language, setLanguage] = useState<Language>('en')

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navbar
          currentView={currentView}
          onViewChange={setCurrentView}
          language={language}
          onLanguageChange={setLanguage}
        />
        <main>
          {currentView === 'converter' ? (
            <ConverterView
              mode={mode}
              onModeChange={setMode}
              language={language}
            />
          ) : (
            <LearnView language={language} />
          )}
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
