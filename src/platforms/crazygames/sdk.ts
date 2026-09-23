declare global {
  interface Window {
    CrazyGames?: {
      SDK?: {
        init: () => Promise<void>;
        game?: {
          gameplayStart?: () => void | Promise<void>;
          gameplayStop?: () => void | Promise<void>;
        };
      };
    };
  }
}

let initialized = false;

export async function initCrazyGames(): Promise<void> {
  if (initialized) return;

  const sdk = window.CrazyGames?.SDK;

  if (!sdk?.init) return;

  try {
    await sdk.init();
    initialized = true;
    console.info('[CrazyGames] SDK initialized');
  } catch (error) {
    console.warn('[CrazyGames] SDK initialization failed:', error);
  }
}

export function crazyGameplayStart(): void {
  window.CrazyGames?.SDK?.game?.gameplayStart?.();
}

export function crazyGameplayStop(): void {
  window.CrazyGames?.SDK?.game?.gameplayStop?.();
}
