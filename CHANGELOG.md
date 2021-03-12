# 1.3.0

-   Object constraint on form type parameter, string constraint on error type parameter. (`FormState<T extends object, State, Error extends string>`)
-   `FormState.errorMap` is now `ErrorMap<T, Error> | Error` instead of just `ErrorMap`.
-   React 17 support
-   Removed form argument from both `useAnyListener` and `AnyListener` render functions, because form may be accessed directly, to avoid confusion. (Breaking)
