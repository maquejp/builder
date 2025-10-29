# Actions Architecture

This folder contains all the individual action classes for the Builder application. Each action is responsible for a specific type of project generation.

## Folder Structure

```text
src/actions/
├── BaseAction.ts                    # Abstract base class for all actions
├── index.ts                         # Barrel export for all actions
├── fullproject/
│   └── FullProjectGenerator.ts      # Full project generation (Action 0)
├── database/
│   └── DatabaseScriptGenerator.ts   # Database script generation (Action 1)
├── backend/
│   └── BackendGenerator.ts          # Backend API generation (Action 2)
├── frontend/
│   └── FrontendGenerator.ts         # Frontend application generation (Action 3)
└── tests/
    └── TestGenerator.ts             # Backend tests generation (Action 4)
```

## Architecture

### BaseAction

All action classes extend from `BaseAction`, which provides:

- Common UI interaction methods
- Abstract methods that must be implemented
- Standardized action execution pattern

### Action Classes

Each action class:

- Extends `BaseAction`
- Implements specific generation logic for its domain
- Has its own folder for better organization
- Contains placeholder methods for future implementation

## Usage

Actions are automatically instantiated by the `Builder` class and executed based on user menu selection:

```typescript
// In Builder.ts
private initializeActions(): void {
  this.actions = [
    new FullProjectGenerator(this.ui),        // index 0
    new DatabaseScriptGenerator(this.ui),     // index 1
    new BackendGenerator(this.ui),            // index 2
    new FrontendGenerator(this.ui),           // index 3
    new TestGenerator(this.ui),               // index 4
  ];
}
```

## Adding New Actions

To add a new action:

1. Create a new folder under `src/actions/` (e.g., `deployment/`)
2. Create your action class extending `BaseAction`
3. Implement the required abstract methods
4. Export the class in `index.ts`
5. Add it to the actions array in `Builder.ts`

## Future Implementation

Each action class contains TODO comments and placeholder methods for future implementation of the actual generation logic.
