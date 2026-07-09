# create-goros

A command-line generator to bootstrap a new Goros application in seconds.

## Usage

```bash
bunx create-goros <project-name>
```

If you do not provide a project name, `create-goros` runs interactively and prompts you for:
1. **Project name**: The folder name.
2. **Template**: Choose between `basic` (minimal start) and `homework` (dogfood reference).
3. **Runtime**: Choose target runtime (`bun` or `node`).
4. **Install dependencies**: Installs packages automatically.
5. **Initialize git**: Configures a git repository inside the project.

## Non-Interactive Mode

When a project name argument is passed, it builds using defaults:
- **template**: basic
- **runtime**: bun
- **install**: false
- **git**: false
