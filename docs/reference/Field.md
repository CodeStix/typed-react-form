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

#### ❌ Inline styling

You can pass the `style` and `className` props to the `Field` component, but this will get repetitive and annoying fast.

```tsx

<Field className="input" errorClassName="input-error" name="field1" />
<Field className="input" errorClassName="input-error" name="field2" />
<Field className="input" errorClassName="input-error" name="field3" />

<Field style={%raw%}{{...}}{%endraw%} errorStyle={%raw%}{{...}}{%endraw%} name="field1" />
<Field style={%raw%}{{...}}{%endraw%} errorStyle={%raw%}{{...}}{%endraw%} name="field2" />
<Field style={%raw%}{{...}}{%endraw%} errorStyle={%raw%}{{...}}{%endraw%} name="field3" />

```

You should only use the `errorStyle`, `dirtyStyle`, `errorClassName` and `dirtyClassName` props in rare situations where you need specific style overrides for a specific field.

#### ✔️ Using custom component

You should pass a custom component to the `as` prop of `Field`. The props required by your component will be placed on the `Field` component (will be type-checked).

<iframe src="https://codesandbox.io/embed/custom-input-typed-react-form-example-ck21d?fontsize=14&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="custom input typed-react-form example"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

Some props of your custom component will be filled in automatically by the `Field` component:

|`onChange`|The change handler, this can be a `React.ChangeEventHandler` or a `(value: T) => void`, ready to be passed to your underlying input.
|`value`|The current value in string format, ready to be passed to the underlying input element.
|`checked`|The current checked state as boolean, ready to be passed to the underlying input element.
|`disabled`|A boolean that will be true when submitting.
|`field`|A [`FormField`](/typed-react-form/reference/useListener.html#return-value) instance, which contains information about the field like the value, its error, the form it is part of and whether is has been modified.
|`style`|Will merge your passed `style` with `errorStyle` when there is an error on this field and `dirtyStyle` when the field has been modified.
|`className`|Will merge your passed className with `field-error` when there is an error on this field and `field-dirty` when the field has been modified. (These classNames can be changed using the `errorClassName` and `dirtyClassName` props)

**If you don't like this way of passing props**, you can also [create custom inputs](/typed-react-form/examples/Custom-input) using the useListener hook (advanced).

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

#### `as` (`"input"` by default)

The element/componment to render, this can be a string specifying "input", "select", "textarea" or a custom component. Is "input" by default. The props of the passed custom component are available on this Field component.

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

#### `innerRef`
The ref prop to pass to the underlaying component/input.

---

## Custom fields/inputs

The builtin `<Field />` component is just an abstraction around the [`useListener`](/typed-react-form/reference/useListener) hook. Using this hook, you can create your own [custom inputs](/typed-react-form/examples/Custom-input).
