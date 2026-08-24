const MODULE_ID = "level-nav-visibility";
const HIDDEN_FLAG = "hiddenFromNavigation";

function isHidden(level: LevelDocument): boolean {
  return level.getFlag(MODULE_ID, HIDDEN_FLAG) === true;
}

function findLevel(element: Element): LevelDocument | null {
  const row = element.closest<HTMLElement>(
    "[data-level-nav-level-id], [data-level-id], [data-level]"
  );
  const levelId = row?.dataset.levelNavLevelId ?? row?.dataset.levelId ?? row?.dataset.level;
  if (!levelId) return null;

  const sceneId = row.closest<HTMLElement>("[data-scene-id]")?.dataset.sceneId;
  if (sceneId) return game.scenes.get(sceneId)?.levels?.get(levelId) ?? null;

  for (const scene of game.scenes) {
    const level = scene.levels?.get(levelId);
    if (level) return level;
  }
  return null;
}

function getLevelRows(root: HTMLElement): Set<HTMLElement> {
  const rows = new Set<HTMLElement>();
  for (const action of root.querySelectorAll<HTMLElement>('[data-action="viewLevel"]')) {
    const dataElement = action.closest<HTMLElement>("[data-level-id], [data-level]");
    if (!dataElement) continue;

    const row =
      action.closest<HTMLElement>("li") ??
      (dataElement === action ? action.parentElement : dataElement);
    if (!row) continue;

    const levelId = dataElement.dataset.levelId ?? dataElement.dataset.level;
    if (!levelId) continue;
    row.dataset.levelNavLevelId = levelId;
    rows.add(row);
  }
  return rows;
}

function decorateNavigation(root: unknown): void {
  if (!(root instanceof HTMLElement)) return;

  for (const row of getLevelRows(root)) {
    const level = findLevel(row);
    if (!level) continue;

    const hidden = isHidden(level);
    row.classList.toggle("level-nav-visibility-hidden", hidden);

    if (!game.user.isGM) {
      row.hidden = hidden;
      continue;
    }

    row.hidden = false;
    let button = row.querySelector<HTMLButtonElement>(
      ":scope > .level-nav-visibility-toggle"
    );
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "level-nav-visibility-toggle icon fa-solid";
      button.dataset.levelVisibilityToggle = "";
      row.append(button);
    }

    button.classList.toggle("fa-eye", !hidden);
    button.classList.toggle("fa-eye-slash", hidden);
    button.ariaLabel = hidden ? "Show level in navigation" : "Hide level from navigation";
    button.dataset.tooltip = button.ariaLabel;
    button.setAttribute("aria-pressed", String(hidden));
  }

  if (game.user.isGM && !root.dataset.levelNavVisibilityBound) {
    root.dataset.levelNavVisibilityBound = "true";
    root.addEventListener("click", onToggleVisibility);
  }
}

async function onToggleVisibility(event: MouseEvent): Promise<void> {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLButtonElement>("[data-level-visibility-toggle]");
  if (!button || !game.user.isGM) return;

  event.preventDefault();
  event.stopPropagation();

  const level = findLevel(button);
  if (!level) return;

  button.disabled = true;
  try {
    await level.setFlag(MODULE_ID, HIDDEN_FLAG, !isHidden(level));
  } catch (error) {
    console.error(`[${MODULE_ID}] Could not update level visibility`, error);
    ui.notifications.error("Could not update level navigation visibility.");
    button.disabled = false;
  }
}

Hooks.on("renderSceneNavigation", (_app: unknown, element: unknown) => {
  decorateNavigation(element);
});

for (const hook of ["createLevel", "updateLevel", "deleteLevel"]) {
  Hooks.on(hook, () => ui.nav?.render());
}

Hooks.once("ready", () => ui.nav?.render());
