interface LevelDocument {
  getFlag(scope: string, key: string): unknown;
  setFlag(scope: string, key: string, value: boolean): Promise<unknown>;
}

interface SceneDocument {
  levels?: { get(id: string): LevelDocument | undefined };
}

declare const game: {
  user: { isGM: boolean };
  scenes: Iterable<SceneDocument> & { get(id: string): SceneDocument | undefined };
};

declare const ui: {
  nav?: { render(): void };
  notifications: { error(message: string): void };
};

declare const Hooks: {
  on(hook: string, callback: (...args: any[]) => void): void;
  once(hook: string, callback: (...args: any[]) => void): void;
};
