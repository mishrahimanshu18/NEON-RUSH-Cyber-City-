export {};

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
