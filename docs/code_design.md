# Code Standards

This document defines the application architecture and implementation standards. Developers and AI agents should read it before creating, changing, or moving code in this project.

## Folder Structure

- Main application features must live in `src/features`.
- Each feature should own its internal scope, such as `screens`, `components`, `hooks`, `providers`, `services`, `types`, `utils`, and `mocks` when needed.
- Shared code used across features must live in `src/shared`.
- Shared components must live in `src/shared/components`.
- Shared utilities must live in `src/shared/utils` or another equivalent shared folder.
- Feature-specific code must not be moved to `shared` unless there is real reuse.

## Folder APIs

- Every created folder must expose its public API through an `index.ts` or `index.tsx`.
- Imports from outside a folder should prefer the folder `index`, not internal files.
- Internal files can exist freely, but they should only be imported directly inside the same module/folder.

## Components And UI

- Use Tamagui native components whenever possible, such as `View`, `Text`, `Button`, `Input`, `ScrollView`, `Image`, `Spinner`, and others.
- When custom styling is needed, create styled components from Tamagui components with `styled`.
- Components must follow the application theme and typography.
- Use React Native components only when Tamagui does not cover the need, such as native APIs, `FlatList`, `RefreshControl`, `Modal`, `StatusBar`, `Animated`, `Alert`, `Platform`, native types, or specific integrations.
- If the need is very specific and neither Tamagui nor React Native base components cover it well, research an external library before implementing complex behavior manually.

## Theme And Typography

- Colors must always come from the application theme.
- Typography must always come from `src/shared/typography`.
- Avoid hardcoded colors in components.
- If a new color is needed, evaluate whether it should be added to the theme first.
- Shared components should use Tamagui tokens, such as `$primary`, `$text`, `$mutedText`, `$background`, `$card`, `$border`, `$error`, `$success`, `$warning`, `$white`, and `$black`.
- Components outside the `TamaguiProvider` must not use Tamagui components or Tamagui tokens.

## Logic And Hooks

- Component logic must live in separate hooks.
- Components should focus on rendering and composition.
- Hooks should live close to the scope that uses them.
- Do not create a global `hooks` folder for everything.
- Shared hooks should only live in `shared` when reused by more than one feature or shared component.

## Providers

- Global providers should only exist when the information is truly needed across the whole application.
- A valid global provider example is session/authentication, such as `useAuthSession`.
- If the information is only used by one route, flow, or feature, the provider must live at the smallest possible level.
- Avoid putting local screen state in a global provider.

## External Data And APIs

- Very dynamic external data or data that depends on other applications must use TanStack Query.
- Lists, remote filters, refresh, cache, invalidation, and synchronization should go through TanStack Query.
- Less frequent and simpler flows, such as login, can use Axios through a centralized service.
- Requests must not live directly inside screen components.
- Create services inside the feature or in `shared/services` when they are reusable.
- Request/response types should live close to the service or inside the feature `types` folder.

## Reusability

- Components should be as reusable as possible.
- If a component becomes too specific to one screen or feature, it should live inside that feature.
- Components in `shared/components` should receive configuration through props and must not depend on feature-specific business rules.
- Before creating a shared component, confirm there is at least one real reuse case.

## Alias Paths

- Prefer alias paths in imports.
- If a relevant new folder is created, add its alias to `tsconfig.json` and `babel.config.js` when applicable.
- Avoid long relative imports between distant modules.
- Relative imports are acceptable inside the same module or feature.

## Final Checklist

- Is feature code in `src/features`, or shared code in `src/shared`?
- Does the new folder have an `index.ts` or `index.tsx`?
- Do visual components use Tamagui whenever possible?
- Do colors and typography come from the theme/typography system?
- Is component logic extracted into a hook when the component is not trivial?
- Are providers placed at the smallest possible scope?
- Does dynamic data use TanStack Query?
- Are services/types outside components?
- Do imports use aliases when appropriate?
- Does `npm run typecheck` pass?
