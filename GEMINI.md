# Project Overview

This is a Next.js application that serves as a brainstorming organizer. It allows users to upload a JSON file containing a project vision and a list of features. These features are then displayed on a Kanban board, where they can be moved between different phases. Users can also add, edit, and filter features by tags, and export the entire session back to a JSON file.

The application is built with the following technologies:

*   **Framework:** Next.js
*   **UI:** React, Radix UI, Tailwind CSS, lucide-react (for icons)
*   **Drag and Drop:** @dnd-kit/core
*   **Forms:** react-hook-form, zod
*   **Toasts:** sonner
*   **Theming:** next-themes

# Building and Running

To build and run this project, you'll need to have Node.js and pnpm installed.

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    This will start the development server on `http://localhost:3000`.

3.  **Create a production build:**
    ```bash
    pnpm build
    ```

4.  **Start the production server:**
    ```bash
    pnpm start
    ```

# Development Conventions

*   **Styling:** The project uses Tailwind CSS for styling. Utility classes are preferred over custom CSS.
*   **Components:** The application is built with a component-based architecture. Reusable components are located in the `components` directory.
*   **State Management:** The application uses React's `useState` hook for local component state.
*   **Linting:** The project uses Next.js's built-in ESLint configuration for linting. You can run the linter with `pnpm lint`.
