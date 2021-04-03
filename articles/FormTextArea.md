# `<FormTextArea />`

A stateful, type-checked form `textarea` element.

These inputs are given a `className` when errored (`typed-form-error`) or modified (`typed-form-dirty`) by default.

```tsx
const form = useForm({
    description: "Ullamco velit eiusmod eiusmod veniam nulla exercitation fugiat.",
});

<FormTextArea form={form} name="description" />;
```

Pretty self-explanatory...

## Props

#### `form` (required)

The form or child form that contains the field to bind to this input.

---

#### `name` (required)

The name of the field in the form that will be bound to this textarea.

---

#### `errorClassName` and `errorStyle`

The className and/or style to set when there is an error on this field. Default className is `typed-form-error`.

---

#### `dirtyClassName` and `dirtyStyle`

The className and/or style to set when this field has been modified. Default className is `typed-form-dirty`.

---

#### `disableOnSubmitting`

Disable this textarea on submit? Default is `true`.

---

#### `hideWhenNull`

Set this prop if you want to hide this input when its field value is `null/undefined`. Default is `false`.
