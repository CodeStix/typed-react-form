# Getting started

Welcome to the **typed-react-form** documentation!

## Step 1: Install

Begin by installing the package into your React project:

```
npm install --save typed-react-form
yarn add typed-react-form
```

This library works with both **Javascript** and **Typescript**. **Typescript** is certainly preferred because of the enforced type-checking!

## Step 2: Creating a form

### Using the `useForm` hook

A form always starts with the `useForm` hook call, this function returns a form state manager ([FormState](/docs/FormState)), which you must then pass to all your inputs (this is required for type-checking).

All of the form hook ([`useForm`](/docs/useForm), [`useChildForm`](/docs/useChildForm) ...) must be called, unconditionally, at the start of your component, just like the normal React hooks.

✔️ **Importing and using `useForm`**

```tsx
import { useForm } from "typed-react-form";

function MyForm() {
    // At the top of the component, first parameter contains default values
    const form = useForm({ email: "" });
}
```

### Creating the submit handler

**typed-react-form** does not expose any submit events or helpers, you must implement your own submitting procedure. This is typically done by using the `<form>` html element with the `onSubmit` event and using a submit button.

✔️ **`<form>` element with `onSubmit` event**

```tsx
import { useForm } from "typed-react-form";

function MyForm() {
    const form = useForm({ email: "" });
    // Use the html form element, which exposes the onSubmit event.
    return (
        <form
            onSubmit={(ev) => {
                // IMPORTANT: Prevent the onSubmit event from reloading the page!
                ev.preventDefault();
                // Do not submit if there is an error! Use form.validate to validate when validateOnChange is disabled.
                if (form.error) return;
                // form.values contains the modified values, form.defaultValues contains the initial values
                console.log("submit", form.values);
            }}>
            <button>Submit!</button>
        </form>
    );
}
```

You can also just use a `<button>` and submitting in the button's `onClick` handler, but this event does not fire when pressing enter in a text input!

### Creating inputs

This library is build upon the fact that only the things that change should rerender (~refresh), for example: when the _name_ field changes, only the inputs that use _name_ field will rerender.

The built-in form elements ([`FormInput`](/docs/FormInput), [`FormSelect`](/docs/FormSelect) ...) implement this by listening for changes only on their specified field. You can also use multiple inputs on the same field (they will the synchronized) and listen for changes on a field by using the [`useListener`](/docs/useListener) hook or [`Listener`](/docs/Listener) component.

You are now ready to create inputs, this library provides the following built-in components to create type-checked inputs:

-   [FormInput](/docs/FormInput)
-   [FormSelect](/docs/FormSelect)
-   [FormTextArea](/docs/FormTextArea)

**When these inputs do not satisfy your needs**, you can always [create your own](/docs/Custom-inputs#example-custom-input). These built-in components are just abstractions around hook calls.

✔️ **Example type-checked form consisting of 2 fields**

```tsx
// Import FormInput
import { useForm, FormInput } from "typed-react-form";

function MyForm() {
    const form = useForm({ email: "", password: "" });
    return (
        <form
            onSubmit={async (ev) => {
                ev.preventDefault();
                if (form.error) return;

                // Notify every input that the form is submitting. This will disable them.
                form.setState({ isSubmitting: true });
                // Fake fetch, by waiting for 500ms
                console.log("submit", form.values);
                await new Promise((res) => setTimeout(res, 500));
                // Notify every input that the form is not submitting anymore.
                form.setState({ isSubmitting: false });
                // Set new default values if needed
                form.setDefaultValues(form.values);
            }}>
            {/* Make sure to pass the form prop! */}
            <FormInput form={form} name="email" type="text" />
            <FormInput form={form} name="password" type="password" />
            <button>Submit!</button>
        </form>
    );
}
```

**When you have an object or array field**, you need to _unwrap_ this field by using a child/array form. When _unwrapped_ you can use the inputs above.

-   [Object fields](/docs/Object-fields)
-   [Array fields](/docs/Array-fields)

## Step 3: It's your turn

Tweak the above example to your desire by...

-   [Reading more about `FormInput`](/docs/FormInput)
-   [Implementing validation](/docs/Validation)
-   [Adding object fields](/docs/Object-fields)
-   [Adding array fields](/docs/Array-fields)
-   [Toggling a field using a checkbox](/docs/Toggling-a-field)
-   [Creating a component which shows the current form values in JSON](/docs/Live-json-component)
-   [Creating a custom input like FormInput, FormSelect ...](/docs/Custom-input)
-   **Look at the sidebar for more...**
