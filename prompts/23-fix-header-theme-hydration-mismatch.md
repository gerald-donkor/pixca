# 23 — Fix Header Theme Hydration Mismatch

## Goal

Fix the React hydration mismatch error occurring at `<Header>` / `<RootLayout>`:
`A tree hydrated but some attributes of the server rendered HTML didn't match the client properties... at Header (components/layout/header.tsx:78:15)`
caused by `ThemeProvider` initializing state with a client-only branch (`if (typeof window !== "undefined")`) that reads `localStorage` during initial hydration.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js client/server boundaries and hydration best practices.
- `.agents/skills/gsap-core/SKILL.md` — Animation and lifecycle consistency.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit format.

---

## Existing code inspected

- `components/layout/theme-provider.tsx` — Client component initializing `theme` with `if (typeof window !== 'undefined') localStorage.getItem(...)`, causing SSR/client initial render divergence.
- `components/layout/header.tsx` — Renders theme switch buttons (`Light`, `Dark`, `Auto`) whose classes depend on `theme`.
- `components/layout/mobile-drawer.tsx` — Renders mobile theme switch buttons.
- `app/layout.tsx` — Root layout wrapping application in `<ThemeProvider>` and `<ClerkProvider>`.
- `components/layout/edition-selector.tsx` & `components/layout/location-selector.tsx` — Working reference patterns using `useSyncExternalStore`.

---

## Decisions and assumptions

1. **Hydration-Safe Theme Storage with `useSyncExternalStore`**:
   - Replace the `typeof window !== "undefined"` `useState` initialization in `ThemeProvider` with `useSyncExternalStore`.
   - `getServerSnapshot()` will return `defaultTheme` (`"system"`), guaranteeing 100% attribute and className parity between server SSR markup and client initial hydration.
   - `getSnapshot()` will read from `localStorage` safely on the client. When storage differs from default, React will update the client state cleanly post-hydration without any hydration warning or error.
2. **Synchronous Theme Dispatch**:
   - `setTheme` will write to `localStorage` and dispatch `window.dispatchEvent(new Event("storage"))` and a custom event so all subscribers update immediately.
3. **Anti-FOUC Inline Script in `app/layout.tsx`**:
   - Add a lightweight synchronous `<script>` inside `<html>` / `<head>` before body hydration to set or remove the `.dark` class on `document.documentElement`, preventing flashes of unstyled light content when dark mode is configured in `localStorage`.

---

## Files likely to change

- `components/layout/theme-provider.tsx` [MODIFY] — Refactor `ThemeProvider` to use `useSyncExternalStore` for hydration-safe storage synchronization and instant event reactivity.
- `app/layout.tsx` [MODIFY] — Add inline anti-FOUC theme initialization script.

---

## Implementation requirements

### 1. `components/layout/theme-provider.tsx`
- Define `subscribe`, `getSnapshot`, and `getServerSnapshot` helpers:
  ```typescript
  const STORAGE_KEY = "pixca-theme";
  const THEME_CHANGE_EVENT = "pixca-theme-change";

  function subscribe(callback: () => void) {
    window.addEventListener("storage", callback);
    window.addEventListener(THEME_CHANGE_EVENT, callback);
    return () => {
      window.removeEventListener("storage", callback);
      window.removeEventListener(THEME_CHANGE_EVENT, callback);
    };
  }

  function getSnapshot(): Theme {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored as Theme;
      }
    } catch {
      // localStorage unavailable
    }
    return "system";
  }

  function getServerSnapshot(): Theme {
    return "system";
  }
  ```
- Use `useSyncExternalStore` in `ThemeProvider` and support explicit local overrides via `setTheme`:
  ```typescript
  export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = STORAGE_KEY,
  }: {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
  }) {
    const storedTheme = React.useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot
    );

    const [overrideTheme, setOverrideTheme] = React.useState<Theme | null>(null);
    const theme = overrideTheme ?? storedTheme ?? defaultTheme;
    const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");

    React.useEffect(() => {
      const root = document.documentElement;

      const applyTheme = () => {
        let resolved: "light" | "dark" = "light";
        if (theme === "system") {
          const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          resolved = systemDark ? "dark" : "light";
        } else {
          resolved = theme;
        }

        setResolvedTheme(resolved);

        if (resolved === "dark") {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      };

      applyTheme();

      if (theme === "system") {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => applyTheme();
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
      }
    }, [theme]);

    const setTheme = React.useCallback(
      (newTheme: Theme) => {
        setOverrideTheme(newTheme);
        try {
          localStorage.setItem(storageKey, newTheme);
          window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
          window.dispatchEvent(new Event("storage"));
        } catch {
          // ignore
        }
      },
      [storageKey]
    );

    return (
      <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }
  ```

### 2. `app/layout.tsx`
- Add an inline anti-FOUC script inside `<head>` to immediately configure `.dark` on `document.documentElement` before rendering:
  ```tsx
  <head>
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var stored = localStorage.getItem('pixca-theme') || 'system';
              var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (stored === 'dark' || (stored === 'system' && systemDark)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          })();
        `,
      }}
    />
  </head>
  ```

---

## Security requirements

- Client-side theme synchronization.
- No sensitive data exposed.
- Inline script only contains local theme detection logic and does not execute untrusted input.

---

## Acceptance criteria

1. **Zero Hydration Mismatch**: Loading the page with any theme set in `localStorage` ("light", "dark", or "system") produces zero React console hydration errors or attribute warnings.
2. **Instant Theme Switching**: Clicking `Light`, `Dark`, or `Auto` in the header or mobile drawer instantly updates active button styling and document theme.
3. **No Flash of Unstyled Content (FOUC)**: On page reload in dark mode, the page renders dark immediately without a white flash.
4. **Typecheck & Lint**: Zero TypeScript errors (`npm run typecheck`) and zero ESLint errors (`npm run lint`).
5. **Clean Production Build**: `npm run build` succeeds without warnings or hydration regressions.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Exact manual test steps expected after implementation

1. Open browser devtools console at `http://localhost:3000/`.
2. Set theme to "Dark" by clicking the "Dark" button in the utility bar.
3. Refresh the page (`Ctrl+R` / `Cmd+R`).
4. Verify that no hydration mismatch warning (`A tree hydrated but some attributes...`) appears in the console.
5. Switch theme to "Light", reload, and verify no console warnings.
6. Switch theme to "Auto", reload, and verify no console warnings.
