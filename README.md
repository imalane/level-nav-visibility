# Level Navigation Visibility

A small, system-agnostic module for Foundry Virtual Tabletop 14. It lets a GM hide individual native Scene Levels from the level lists in the top scene navigation menu.

## Use

1. Enable **Level Navigation Visibility** in your world.
2. Open a scene with multiple levels and expand its level list in the top navigation menu.
3. As a GM, click the eye beside a level to hide or show it.

Hidden levels remain visible to GMs as dimmed rows with an eye-slash button, but are omitted from players' navigation. The choice is stored on the Level document and updates connected clients automatically.

This module only changes the navigation menu. It does not alter level availability, token permissions, vision, or the currently viewed level.

## Compatibility

- Foundry VTT 14 (native Scene Levels)
- System agnostic

## Installation for development

Install the build dependencies and create the Foundry-ready bundle:

```bash
npm install
npm run build
```

Place or link this repository as `level-nav-visibility` inside Foundry's `Data/modules` directory, then enable it in a world. Foundry loads the generated `dist/main.js` file.

Use `npm run watch` for an unminified bundle that rebuilds as TypeScript source changes. Use `npm run build` to type-check and create the minified production bundle used by release packages. Do not edit files in `dist/` directly.

## License

MIT. See [LICENSE](LICENSE).
