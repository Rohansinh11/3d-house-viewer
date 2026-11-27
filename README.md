# tiiny host — independent villa viewer

## Open locally
Open `index.html` in a modern browser with WebGL enabled. For browsers that block local `fetch()` of `prompt.txt`, serve this folder from any local static-file server. The model itself is self-contained and has no remote runtime assets.

## Files
- `index.html`: branded Tiiny Host shell, two fixed bars and prompt dialog.
- `viewer.html`, `viewer.css`, `viewer.js`: independent procedural WebGL model and controls.
- `house-config.json`: editable project assumptions and floor/room metadata.
- `prompt.txt`: reusable brief synchronized with this implementation.
- `THIRD-PARTY-NOTICES.txt`: attribution/reuse note.

## Important limitations
This is an independent conceptual recreation based on exterior images. The interior arrangement, furniture and room sizes are indicative. The first-floor 2BHK is proposed, not a measured plan. It is not a substitute for measured architectural drawings, BIM, engineering or code review. Walk mode is a simple camera navigation mode and does not implement physically accurate collision detection or stair traversal.

## Tiiny Host
Upload the deployment ZIP to https://tiiny.host. This package has not been published from this environment; no live Tiiny Host URL is claimed.
