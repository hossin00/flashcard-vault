import { useState } from 'react'
import SplashScreen from './components/SplashScreen'
import Onboarding from './components/Onboarding'
import App from './App'

const DONE_KEY = 'flashcard-vault_onboarded_v1'
type Phase = 'splash' | 'onboard' | 'app'

export default function AppWrapper() {
  const [phase, setPhase] = useState<Phase>('splash')
  const features = ["Spaced repetition system", "Create unlimited decks", "Study streak tracker", "Import from CSV"]
  return (
    <>
      {phase === 'splash' && <SplashScreen onDone={()=>setPhase(localStorage.getItem(DONE_KEY)?'app':'onboard')} color1="#22c55e" color2="#16a34a" emoji="🃏" name="FlashCard Vault" tagline="Offline flashcard study system"/>}
      {phase === 'onboard' && <Onboarding onDone={()=>{localStorage.setItem(DONE_KEY,'1');setPhase('app')}} color1="#22c55e" emoji="🃏" name="FlashCard Vault" features={features}/>}
      {phase === 'app' && <App/>}
    </>
  )
}