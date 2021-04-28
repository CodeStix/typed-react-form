---
layout: default
parent: Reference
title: FieldError component
nav_order: 5
---

# `<FieldError />`

This component renders an error for a specific form field.

It renders a `<></>` (React.Fragment) containing the error by default. You can change what is rendered by passing a tag name (`"p"`) or custom component to the `as` prop.

```tsx
const form = useForm(
    {
        name: "John Tester"
    },
    (values) => ({ name: values.name.length < 5 ? "Name must be longer" : undefined }) // Example validator
);

<Field form={form} name="name" />

// Will render a `React.Fragment` (plain text) element on error.
<FieldError form={form} name="name" />

// Will render a `p` element on error.
<FieldError as="p" form={form} name="name" />

function CustomError(props: {children?: React.ReactNode}) {
    return <p style={{color: "red", margin: "0.3em"}}>
        {props.children}
    </p>
}

// Will render `CustomError`, with the error passed in the children prop, on error.
<FieldError as={CustomError} form={form} name="name" />
```
