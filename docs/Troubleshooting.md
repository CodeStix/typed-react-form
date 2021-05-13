---
title: Troubleshooting
layout: default
nav_order: 100
---

# Troubleshooting

If you don't find your solution here, you can [open an issue](https://github.com/CodeStix/typed-react-form/issues/new)

---

## I press submit but nothing happens

(when using `<form>` with `form.handleSubmit`)

Your form will not submit if there is an validation error. If you want to see the current errors, add this line to your form:

```tsx
const form = useForm(...);
// Show a json representation of the errors in form,
// use AnyListener to rerender when anything in the form changes
return <form>
    <AnyListener form={form} render={() => <pre>{JSON.stringify(form.errorMap, null, 2)}</pre>} />
</form>
```

---

## Problem with styled-components

When you use [styled-components](https://github.com/styled-components/styled-components) to style your inputs, there is a weird bug that breaks type checking on the styled component.

**Use the following solution:**

```tsx
// Example styled CustomInput
const StyledCustomInput: typeof CustomInput = styled(CustomInput)`
    &.field-dirty {
        background-color: #0001;
    }

    &.field-error {
        color: red;
        font-weight: bold;
    }
`;
```

---

## Element type is invalid: expected a string (for built-in components) or a class/function but got: undefined

This sometimes happens after installing this package. Restart your project to fix it. (restart `react-scripts`)
