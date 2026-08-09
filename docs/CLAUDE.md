# Clinix Lens Project Rules & Guidelines

These rules govern the development, styling, and implementation of features within the Clinix Lens codebase. All development agents and engineers must adhere to these rules.

## Core Rules

- **Angular Best Practices**: Always follow the latest recommendations from the Angular team (for the installed version v22+). Refer to [docs.angular.dev](https://docs.angular.dev) for official implementation patterns.
- **No Framework Fighting**: Do not fight the framework. Utilize Angular's built-in features (such as Standalone Components, Signals, control flow, and animations) to get results.
- **Feature-Wise Architecture**: Organise application code by feature areas (e.g., `src/app/features/patients`, `src/app/features/search`) rather than generic utility groups.
- **Code Self-Documentation**: Code must be self-documenting. Use descriptive naming for variables, methods, and classes to minimize the need for inline comments.
- **Comments Philosophy**: Comments must only explain *why* a certain logic or approach was used, never *what* the code does. If the code is hard to understand, refactor it first.
- **Test Suites Requirement**: Always add a comprehensive test suite (`.spec.ts` files) alongside any feature or component being implemented.
- **Test Ambiguity Resolution**: If a test case or result has any ambiguity, stop and ask the user for clarification.
- **Review Prior to Coding**: Always create an implementation plan first and get it approved before generating any functional code.
- **Architecture Continuity**: Review the existing architecture before adding code. New additions must integrate seamlessly and make sense alongside the rest of the codebase.
- **Context Updates**: Always update the context files (such as project indexes, rulesets, or walkthroughs) after a prompt or task is executed.
