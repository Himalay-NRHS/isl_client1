import { useState } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { Navbar } from './components/Navbar'
import { ConverterView } from './components/ConverterView'
import { LearnView } from './components/LearnView'
import type { Mode } from './types'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState<'converter' | 'learn'>('learn')
  const [mode, setMode] = useState<Mode>('text-to-sign')

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Navbar
            currentView={currentView}
            onViewChange={setCurrentView}
          />
          <main>
            {currentView === 'converter' ? (
              <ConverterView
                mode={mode}
                onModeChange={setMode}
              />
            ) : (
              <LearnView />
            )}
          </main>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
