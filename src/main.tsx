
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SupabaseProvider } from './providers/SupabaseProvider'
import { WineTastingProvider } from './context/WineTastingContext'

createRoot(document.getElementById("root")!).render(
  <SupabaseProvider>
    <WineTastingProvider>
      <App />
    </WineTastingProvider>
  </SupabaseProvider>
);
