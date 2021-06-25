---
layout: default
title: Getting started
nav_order: 1
---

# Getting started

Welcome to the **typed-react-form** documentation!

## Step 1: Install

Begin by installing the package into your React project:

```
npm install --save typed-react-form
yarn add typed-react-form
```

This library works with both **Javascript** and **Typescript**. Typescript is certainly preferred because of the enforced type-checking!

**Make sure to restart your project after installing. (restart `react-scripts`)**

## Step 2: Creating a form

### Using the `useForm` hook

A form always starts with the `useForm` hook call, this function returns a form state manager ([FormState](/typed-react-form/reference/FormState)), which you must then pass to all your inputs.

✔️ **Importing and using `useForm`**

```tsx
import { useForm } from "typed-react-form";

function MyForm() {
    // At the top of the component, first parameter contains default values
    const form = useForm({ email: "" });
}
```

<!-- <iframe src="https://codesandbox.io/embed/basic-typed-react-form-example-zz7uw?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="basic typed-react-form example"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe> -->

### Creating the submit handler

Use `form.handleSubmit` to validate before calling your function. It does not get called if there is a validation error, and prevents the page from reloading.

✔️ **`<form>` element with `onSubmit` event**

```tsx
import { useForm } from "typed-react-form";

function MyForm() {
    const form = useForm({ email: "" });

    function submit() {
        // You don't have to use form.handleSubmit, it just validates
        // your form before calling this function
        console.log("submit", form.values);
    }

    // Use the standard html form element, which has the onSubmit event.
    // Make sure to add type="submit" to your submit button
    return (
        <form onSubmit={form.handleSubmit(submit)}>
            <button type="submit">Submit!</button>
        </form>
    );
}
```

### Creating inputs

Use the `<Field/>` component to create an input. (Which is type checked, you cannot misspell the field name, awesome!)

✔️ **Example type-checked form consisting of 2 fields**

```tsx
import { useForm, Field } from "typed-react-form";

function MyForm() {
    const form = useForm({ email: "", password: "" });

    async function submit() {
        // Implement your submit logic here...
        console.log("submitting", form.values);
        // Optional: set new default values
        form.setValues(form.values);
    }

    return (
        <form onSubmit={form.handleSubmit(submit)}>
            {/* Make sure to pass the form prop! */}
            <Field form={form} name="email" type="text" />
            <Field form={form} name="password" type="password" />
            <button type="submit">Submit!</button>
        </form>
    );
}
```

You can also create checkboxes, radio buttons, textareas and selects with this component, look [here](/typed-react-form/reference/Field) for more information.

If the builtin Field components does not satisfy your needs, you can always [implement your own](/typed-react-form/examples/Custom-input#example-custom-input) custom input component. These built-in components are just abstractions around hook calls.

## Step 3: It's your turn

Tweak the above example to your desire by...

-   [Reading more about `<Field/>`](/typed-react-form/reference/Field)
-   [Implementing validation](/typed-react-form/validation)
-   [Using object fields](/typed-react-form/advanced/Object-fields)
-   [Using array fields](/typed-react-form/advanced/Array-fields)
-   [Toggling a field using a checkbox](/typed-react-form/advanced/Toggling-a-field)
-   [Creating a component which shows the current form values in JSON](/typed-react-form/examples/Live-json-component)
-   [Creating a custom input like `<Field/>`](/typed-react-form/examples/Custom-input)
-   Look at the sidebar for more...
