import { useGame, SCREENS } from './context/GameContext';
import ParticlesBackground from './components/ui/ParticlesBackground';
import Toast from './components/ui/Toast';

// Screens
import MenuScreen from './components/screens/MenuScreen';
import LobbyScreen from './components/screens/LobbyScreen';
import RoleRevealScreen from './components/screens/RoleRevealScreen';
import InterrogationScreen from './components/screens/InterrogationScreen';
import VotingScreen from './components/screens/VotingScreen';
import SpyGuessScreen from './components/screens/SpyGuessScreen';
import GameOverScreen from './components/screens/GameOverScreen';

function AppContent() {
    const { state } = useGame();

    const screenComponents = {
        [SCREENS.MENU]: MenuScreen,
        [SCREENS.LOBBY]: LobbyScreen,
        [SCREENS.ROLE_REVEAL]: RoleRevealScreen,
        [SCREENS.INTERROGATION]: InterrogationScreen,
        [SCREENS.VOTING]: VotingScreen,
        [SCREENS.SPY_GUESS]: SpyGuessScreen,
        [SCREENS.GAME_OVER]: GameOverScreen,
    };

    const CurrentScreen = screenComponents[state.currentScreen] || MenuScreen;

    return (
        <div className="relative w-full max-w-md mx-auto min-h-dvh flex flex-col bg-spy-dark text-gray-100 overflow-hidden shadow-2xl">
            {/* Background Effect */}
            <ParticlesBackground />

            {/* Main Content */}
            <div className="relative z-10 w-full flex-1 flex flex-col">
                <CurrentScreen />
            </div>

            {/* Global Toast */}
            <Toast />
        </div>
    );
}

import { GameProvider } from './context/GameContext';

export default function App() {
    return (
        <GameProvider>
            <AppContent />
        </GameProvider>
    );
}
