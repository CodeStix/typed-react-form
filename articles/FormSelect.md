# `<FormSelect />`

A stateful, type-checked form `select` element.

These inputs are given a `className` when errored (`typed-form-error`) or modified (`typed-form-dirty`) by default.

```tsx
const form = useForm({
    language: "english",
    visitedCountries: ["sweden"]
});

// Enum field
<FormSelect form={form} name="language">
    <option value="english">English</option>
    <option value="dutch">Dutch</option>
    <option value="french">French</option>
</FormSelect>

// Primitive array field (primitive meaning non-object)
<FormSelect form={form} name="visitedCountries" multiple>
    <option value="sweden">Sweden</option>
    <option value="russia">Russia</option>
    <option value="kroatia">Kroatia</option>
</FormSelect>

```

## Props

#### `form` (required)

The form or child form that contains the field to bind to this select input.

---

#### `name` (required)

The name of the field in the form that will be bound to this select input.

---

#### `errorClassName` and `errorStyle`

The className and/or style to set when there is an error on this field. Default className is `typed-form-error`.

---

#### `dirtyClassName` and `dirtyStyle`

The className and/or style to set when this field has been modified. Default className is `typed-form-dirty`.

---

#### `disableOnSubmitting`

Disable this select input on submit? Default is `true`.

---

#### `hideWhenNull`

Set this prop if you want to hide this input when its field value is `null/undefined`. Default is `false`.
