# Future Tasks

## Save States — MongoDB (logged 2026-04-29)
Implement persistent save states stored in MongoDB.
- Each save gets a short unique identifier string (e.g. "KRT-4X9Z-2")
- Player pastes the ID at the title screen to resume a career
- All gameState serialized to a MongoDB document keyed by the ID
- No account/login required — the ID IS the save
- Consider: save on every hub visit, or explicit "save game" button
