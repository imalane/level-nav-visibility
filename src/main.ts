const MODULE_ID = "level-nav-visibility";
const HIDDEN_FLAG = "hiddenFromNavigation";

function isHidden(level: LevelDocument): boolean {
  return level.getFlag(MODULE_ID, HIDDEN_FLAG) === true;
}

function findLevel(element: Element): LevelDocument | null {
  const row = element.closest(
    "[data-level-nav-level-id], [data-level-id], [data-level]"
  );
  if (!(row instanceof HTMLElement)) return null;

  const levelId = row.dataset.levelNavLevelId ?? row.dataset.levelId ?? row.dataset.level;
  if (!levelId) return null;

  const sceneRow = row.closest("[data-scene-id]");
  const sceneId = sceneRow instanceof HTMLElement ? sceneRow.dataset.sceneId : undefined;
  if (sceneId) return game.scenes.get(sceneId)?.levels?.get(levelId) ?? null;

  for (const scene of game.scenes) {
    const level = scene.levels?.get(levelId);
    if (level) return level;
  }
  return null;
}

function getLevelRows(root: HTMLElement): Set<HTMLElement> {
  const rows = new Set<HTMLElement>();
  for (const action of root.querySelectorAll('[data-action="viewLevel"]')) {
    if (!(action instanceof HTMLElement)) continue;
    const dataElement = action.closest("[data-level-id], [data-level]");
    if (!(dataElement instanceof HTMLElement)) continue;

    const candidate =
      action.closest("li") ??
      (dataElement === action ? action.parentElement : dataElement);
    if (!(candidate instanceof HTMLElement)) continue;
    const row = candidate;

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
    const existingButton = row.querySelector(":scope > .level-nav-visibility-toggle");
    let button = existingButton instanceof HTMLButtonElement ? existingButton : null;
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
  const candidate = event.target.closest("[data-level-visibility-toggle]");
  if (!(candidate instanceof HTMLButtonElement) || !game.user.isGM) return;
  const button = candidate;

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
