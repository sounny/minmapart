# AGENT GUIDANCE

This repository does not currently include automated tests. To help future agents understand past work, log notable changes and ideas in the **Agent Log** below. When you make significant updates or have suggestions, add a dated entry summarizing your thoughts.

## Agent Log
- 2024-05-22: Initial creation of `AGENTS.md` to keep a running history of changes and ideas. Remember to append future notes here.
- 2025-08-06: Updated the application's visual style for a more modern, minimalist aesthetic. Changed the basemap to Stamen Toner for a high-contrast, black-and-white look. Switched the font to "Roboto" and adjusted text sizes to make the place name more prominent.
- 2025-08-06: Replaced Stamen Toner basemap with Stadia Stamen Toner lines to display only street lines for an even cleaner appearance.
- 2025-08-06: Display map center coordinates during panning and lowered the title position to sit closer to the coordinate text.
- 2025-08-13: Applied a white fade overlay to the bottom one-sixth of the map to improve text readability.
- 2025-08-14: Increased fade to cover the bottom fifth of the map, moved the title closer to the coordinates, and switched overlay text to the narrower Roboto Condensed font.
- 2025-08-14: Reduced the title's bottom offset to tighten spacing above the coordinate text.
- 2025-08-19: Raised bottom fade above road lines by setting pseudo-element z-index so street lines appear under the fade.
- 2025-08-21: Added a center marker overlay, geolocation quick-center button, clearer status messaging, and refreshed control styling to guide users.
- 2025-08-22: Softened the layout with a sticky, blurred control bar and resized the map preview to better fit on screen without overwhelming the UI.
