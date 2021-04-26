# `<FormInput />`

A stateful, type-checked form `input` element.

The input transforms its value based on the `type` prop, which **currently supports the following input types**:

-   `text`
-   `number`
-   `date` (Date and number timestamp)
-   `checkbox`
-   `radio`

It is allowed to use multiple inputs on the same field, all of them will be synchronized. These inputs are given a `className` when errored (`typed-form-error`) or modified (`typed-form-dirty`) by default.

## Examples

```tsx
const form = useForm({
    name: "codestix",
    age: 19,
    birthDate: new Date(),
    birthDateTimestamp: new Date().getTime(),
    likePasta: false,
    gender: "male",
    favoriteDrinks: ["coffee"],
    description: "Someone who dislikes coffee"
});

// String field
<FormInput form={form} type="text" name="name" />

// Number field
<FormInput form={form} type="number" name="age" />

// Date field
<FormInput form={form} type="date" name="birthDate" />

// Timestamp (number as a date) field
<FormInput form={form} type="date" name="birthDateTimestamp" dateAsNumber />

// Boolean field
<FormInput form={form} type="checkbox" name="likePasta" />

```

### Radio buttons

Radio buttons must be given a value, and can be used for fields of different types.

```tsx

// Enum field
<FormInput form={form} type="radio" name="gender" value="male" />
<FormInput form={form} type="radio" name="gender" value="female" />

// Boolean field
<FormInput form={form} type="radio" name="likePasta" value={true} />
<FormInput form={form} type="radio" name="likePasta" value={false} />
```

### Checkboxes

Checkboxes behave like a boolean field by default, but when given a value, it behaves as a primitive array field (like a select with multiple = true). They can also set values on check/uncheck, this is useful for toggling fields.

```tsx
// Boolean field
<FormInput form={form} type="checkbox" name="likePasta" />

// Primitive array field (primitive meaning non-object)
<FormInput form={form} type="checkbox" name="favoriteDrinks" value="coffee" />
<FormInput form={form} type="checkbox" name="favoriteDrinks" value="fanta" />
<FormInput form={form} type="checkbox" name="favoriteDrinks" value="beer" />

// Toggling other field, notice setNullOnUncheck and value=""
<FormInput form={form} type="checkbox" name="description" setNullOnUncheck value="" />
// Option 1: Use the hideWhenNull prop
<FormTextArea form={form} name="description" hideWhenNull />
// Option 2: Listen for changes on the description field, and hide the textarea when the value is null. More flexibility.
<Listener form={form} name="description" render={
    ({ value }) => value !== null && <FormTextArea form={form} name="description" />
}/>
```

### Submit

You **cannot** use FormInput to create a submit button (type="submit"). Use one of the following alternatives:

-   ```tsx
    <input type="submit" value="Click here to submit" />
    ```
-   ```tsx
    <button>Click here to submit</button>
    ```

## Props

#### `form` **(required)**

The form or child form that contains the field to bind to this input.

#### `name` **(required)**

The name of the field in the form that will be bound to this input.

#### `errorClassName` and `errorStyle`

The className and/or style to set when there is an error on this field. Default className is `typed-form-error`.

#### `dirtyClassName` and `dirtyStyle`

The className and/or style to set when this field has been modified. Default className is `typed-form-dirty`.

#### `disableOnSubmitting`

Disable this input on submit? Default is `true`.

#### `dateAsNumber` (only type="date")

Serialize this fields value as a timestamp instead of a Date object.

#### `hideWhenNull`

Set this prop if you want to hide this input when its field value is `null/undefined`. Default is `false`.

#### `setNullOnUncheck` and `setUndefinedOnUncheck` (only type="checkbox")

When using one of these props, the checkbox will set null/undefined on the field when unchecked. This prop is only valid for checkboxes. (Can mimic the same behaviour with radio buttons using value props).

Make sure you pass along a `value` too, this is the value that will be set when it gets checked again. Not doing so, will cause a console warning.

#### `value` (only type="radio" or type="checkbox")

-   The value of the radio button when using multi-value fields.
-   The value of the checkbox when using primitive arrays.
-   The on-checked value of the checkbox when using the `setNullOnUncheck/setUndefinedOnUncheck` prop.

All of the input components are wrappers and abstractions around the [`useListener`](/docs/useListener) hook. Using this hook, you can create your own [custom inputs](/docs/Custom-input).