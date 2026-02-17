import { useGame } from '../../context/GameContext';

export default function Toast() {
    const { state } = useGame();

    if (state.toasts.length === 0) return null;

    const typeStyles = {
        success: 'bg-innocent text-white',
        error: 'bg-danger text-white',
        info: 'bg-blue-500 text-white',
        warning: 'bg-gold text-spy-dark',
    };

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2">
            {state.toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold shadow-lg animate-slide-up ${typeStyles[toast.type] || typeStyles.info}`}
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );
}
