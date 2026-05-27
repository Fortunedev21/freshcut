# Contributing to Freshcut 229

Thank you for your interest in contributing to the **Freshcut 229** codebase! We welcome contributions from everyone to help make this barbershop web application as robust and beautiful as possible.

Please read this document to understand how you can participate in the development process.

---

## 🛠️ How to Contribute

### 1. Reporting Bugs & Suggesting Features
*   Check if the bug or feature request has already been reported in the issue tracker.
*   If not, open a new issue with a clear title, description, steps to reproduce, and screenshots (if applicable).
*   For security-sensitive vulnerabilities, please refer to our [Security Policy](SECURITY.md) instead of opening a public issue.

### 2. Submitting Pull Requests
1.  **Fork** the repository and create your branch from the `main` branch.
    *   Use descriptive branch names: `feature/your-feature-name` or `bugfix/issue-description`.
2.  **Install dependencies** using npm:
    ```bash
    npm install
    ```
3.  **Make your changes**, ensuring you follow our coding guidelines (see below).
4.  **Validate your code** locally before submitting:
    *   Check for linting errors: `npm run lint`
    *   Build the project to verify TypeScript types and compilation: `npm run build`
5.  **Commit** your changes with clear, structured commit messages (e.g. `feat: add product persistence to cart` or `fix: resolve mobile layout overlapping`).
6.  **Push** your branch to your fork and submit a **Pull Request** to the `main` branch.

---

## 📐 Coding Guidelines

To keep the codebase clean, readable, and maintainable, please adhere to these guidelines:

### 1. TypeScript & React
*   Always use TypeScript type declarations. Avoid using `any` type.
*   Prefer functional components with React Hooks.
*   Ensure all client-side components have the `"use client";` directive at the very top.
*   Avoid inline calculation logic inside components when possible; delegate to clean utility functions (e.g., [utils/format.ts](utils/format.ts) for price formatting).

### 2. Styling (Tailwind CSS v4)
*   Leverage Tailwind CSS utility classes for styling.
*   Use predefined custom design tokens defined in [app/globals.css](app/globals.css) (such as `--glass-bg`, `--glass-border`, etc.) to maintain visual coherence.
*   Avoid adding ad-hoc arbitrary layout values unless necessary; stay within the defined Tailwind spacing and color values.
*   Test styles for both desktop and mobile responsiveness (using Tailwind responsive breakpoints `sm:`, `md:`, `lg:`, etc.).

---

## 🤝 Code of Conduct

Participation in this project is subject to the rules outlined in our [Code of Conduct](CODE_OF_CONDUCT.md). Please read and respect it in all community interactions.
