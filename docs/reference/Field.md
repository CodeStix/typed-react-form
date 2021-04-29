---
layout: default
parent: Reference
title: Field component
nav_order: 1
---

# `<Field />`

A type-checked form field.

This component renders an `input` by default. This can be changed to `textarea`, `select`, or a custom component by passing it to the `as` prop.

The input transforms its value based on the `type` prop, which **currently supports the following input types**:

-   `text`
-   `number`
-   `date` (Date and number timestamp, see `dateAsNumber` prop)
-   `checkbox`
-   `radio`

It is allowed to use multiple inputs on the same field, all of them will be synchronized.

These inputs are given a `className` when errored (`field-error`) or modified (`field-dirty`) by default.

## Examples

```tsx
const form = useForm({
    name: "John",
    age: 19,
    birthDate: new Date(),
    birthDateTimestamp: new Date().getTime(),
    likesPasta: false,
    gender: "male",
    favoriteDrinks: ["coffee"],
    description: "Working.."
});

// String field
<Field form={form} type="text" name="name" />

// Number field
<Field form={form} type="number" name="age" />

// Date field
<Field form={form} type="date" name="birthDate" />

// Timestamp (number as a date) field
<Field form={form} type="date" name="birthDateTimestamp" dateAsNumber />

// Boolean field
<Field form={form} type="checkbox" name="likesPasta" />

```

### Radio buttons

Radio buttons must be given a value, and can be used for fields of different types.

```tsx

// Enum field
<Field form={form} type="radio" name="gender" value="male" />
<Field form={form} type="radio" name="gender" value="female" />

// Boolean field
<Field form={form} type="radio" name="likesPasta" value={true} />
<Field form={form} type="radio" name="likesPasta" value={false} />
```

### Checkboxes

Checkboxes behave like a boolean field by default, but when given a value, it behaves as a primitive array field (like a select with multiple = true). They can also set values on check/uncheck, this is useful for toggling fields.

```tsx
// Boolean field
<Field form={form} type="checkbox" name="likesPasta" />

// Primitive array field (primitive meaning non-object)
<Field form={form} type="checkbox" name="favoriteDrinks" value="coffee" />
<Field form={form} type="checkbox" name="favoriteDrinks" value="fanta" />
<Field form={form} type="checkbox" name="favoriteDrinks" value="beer" />

// Toggling other field, notice setNullOnUncheck and value=""
<Field form={form} type="checkbox" name="description" setNullOnUncheck value="" />
// Option 1: Use the hideWhenNull prop
<Field as="textarea" form={form} name="description" hideWhenNull />
// Option 2: Listen for changes on the description field, and hide the textarea when the value is null. More flexibility.
<Listener form={form} name="description" render={
    ({ value }) => value !== null && <Field as="textarea" form={form} name="description" />
}/>
```

### Select

```tsx
const form = useForm({
    language: "english",
    visitedCountries: ["sweden"]
});

// Enum field
<Field as="select" form={form} name="language">
    <option value="english">English</option>
    <option value="dutch">Dutch</option>
    <option value="french">French</option>
</Field>

// Primitive array field (primitive meaning non-object)
<Field as="select" form={form} name="visitedCountries" multiple>
    <option value="sweden">Sweden</option>
    <option value="russia">Russia</option>
    <option value="kroatia">Kroatia</option>
</Field>
```

### Textarea

```tsx
const form = useForm({
    description: "Ullamco velit eiusmod eiusmod veniam nulla exercitation fugiat."
});

<Field as="textarea" form={form} name="description" />;
```

### Styling/custom component

You can pass a custom component to the `as` prop of `Field`. The props required by your component will be placed on the `Field` component (will be type-checked).

Some props of your custom component will be filled in automatically by the `Field` component:

-   `onChange`: a change handler, this can be a `React.ChangeEventHandler` or a `(value: T) => void`, ready to be passed to your underlying input.
-   `value`: the current value in string format, ready to be passed to the underlying input element
-   `checked`: the current checked state as boolean, ready to be passed to the underlying input element
-   `disabled`: a boolean that will be true when submitting
-   `field`: a [`FormField`](/typed-react-form/reference/useListener.html#return-value) instance, which contains information about the field like the value, its error, the form it is part of and whether is has been modified.

```tsx
function CustomInput(props: { value: any; onChange: React.ChangeEventHandler }) {
    return <input value={props.value} onChange={props.onChange} style={{ padding: "0.3em" }} />;
}

// The value and onChange props are handled by Field
<Field as={CustomInput} />;

function StyledCustomInput(props: { value: any; onChange: React.ChangeEventHandler; style: React.CSSProperties }) {
    return <input value={props.value} onChange={props.onChange} style={{ ...props.style, padding: "0.3em" }} />;
}

// Style prop must be given (because it is required on the CustomInput component), typescript error otherwise
<Field as={StyledCustomInput} style={{ color: "gray" }} />;
```

### Submit

You **cannot** use Field to create a submit button (type="submit"). Use one of the following alternatives:

-   ```tsx
    <form>
        <input type="submit" value="Click here to submit" />
    </form>
    ```
-   ```tsx
    <form>
        <button type="submit">Click here to submit</button>
    </form>
    ```

## Props

#### `form` **(required)**

The form or child form that contains the field to bind to this input.

#### `name` **(required)**

The name of the field in the form that will be bound to this input.

#### `errorClassName` and `errorStyle`

The className and/or style to set when there is an error on this field. Default className is `field-error`.

#### `dirtyClassName` and `dirtyStyle`

The className and/or style to set when this field has been modified. Default className is `field-dirty`.

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

---

## Custom fields/inputs

The builtin `<Field />` component is just an abstraction around the [`useListener`](/typed-react-form/reference/useListener) hook. Using this hook, you can create your own [custom inputs](/typed-react-form/examples/Custom-input).
