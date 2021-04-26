---
layout: default
nav_order: 100
---

# Problem with styled-components

For some reason when using the builtin inputs (FormInput, FormSelect ...) and [styled-components](https://github.com/styled-components/styled-components), there is a weird bug that breaks type checking on the styled component.

**Use the following solution:**

```tsx
import { StyledFix } from "typed-react-form";

// Example styled FormInput
// Use the StyledFix helper type to explicitly define the type.
const CustomInput: StyledFix<typeof FormInput> = styled(FormInput)`
    &.typed-form-dirty {
        background-color: #0001;
    }

    &.typed-form-error {
        color: red;
        font-weight: bold;
    }
`;
```

**If you are using styled with custom props, use the following solution:**

```tsx
import { StyledFix } from "typed-react-form";

// Example styled FormInput with styled props (primaryColor)
// Use the StyledFix helper type to explicitly define the type and prop type.
const CustomInput: StyledFix<typeof FormInput, { primaryColor: string }> = styled(FormInput)<{ primaryColor: string }>`
    border: 1px solid ${(e) => e.primaryColor};

    &.typed-form-dirty {
        background-color: #0001;
    }

    &.typed-form-error {
        color: red;
        font-weight: bold;
    }
`;
```

🤔 There must be a better way to fix this, this is a temporary solution.
