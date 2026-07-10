# Error Handling in Boronix

Boronix prioritizes developer experience (DX) by making runtime and design-time errors clear, descriptive, and actionable.

## Dev Error Page
During development (running `boronix dev`), Boronix intercepts errors and renders a detailed diagnostic page:
- **Phase Isolation**: Identifies where the error happened: `config`, `middleware`, `layout`, `page-loader`, `page-render`, `api`, `action`, `static`, or `router`.
- **Code Frame**: Displays the exact source file snippet, highlighting the line of failure and pointing a caret to the error column.
- **Clean Stack**: Cleans up internal framework frames, highlighting your application code.

## Production Error Page
In production, Boronix hides stack traces and details, showing a clean, safe 500 error page or falling back to your defined [Error Boundaries](error-boundaries.md).
