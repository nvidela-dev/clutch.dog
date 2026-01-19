# clutch.dog
<img width="720" height="393" alt="image" src="https://github.com/user-attachments/assets/60f3774a-98f0-414f-9366-d593bd7d2d17" />

Interactive coding exercises for Express and React.

## Overview

A browser-based course platform where students can:

- Write code in a Monaco-powered editor (VS Code-like experience)
- Execute code safely in the browser using Web Workers
- Run tests and get instant pass/fail feedback
- Work through exercises starting with Express APIs, then React

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor (planned)
- **Execution**: Web Workers for safe client-side code execution

## Project Structure

```
src/
├── app/          # Next.js App Router pages
├── components/   # React components
└── ...
```

## Development

After initial setup, all features are developed through PRs. Each PR corresponds to a single task/feature.
