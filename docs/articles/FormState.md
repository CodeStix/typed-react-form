# `FormState`

The `FormState` class contains all the state of a form. This includes values, default values, errors, dirty flags and form state. You should always use the `useForm` or `useChildForm` hooks to create an instance of this class.

This class provides a lot of useful functions to manipulate form values and state.

## Properties

#### `values` **(readonly)**

The values of the form. Can be set with `setValues()`.

#### `defaultValues` **(readonly)**

The default values of the form. Input elements do not change this. This gets used to reset the form and to calculate dirty flags. Can be set with `setDefaultValues()`.

#### `childMap` **(readonly)**

Each child form bound registers itself in this object. It maps field names to `ChildFormState` instances.

#### `dirtyMap` **(readonly)**

Maps field names to dirty values. A field is dirty when its value is not equal anymore to its default value.

#### `errorMap` **(readonly)**

Maps field names to errors. Can be set with `setErrors()`.

#### `state` **(readonly)**

Gets the current form state. Form state contains variables like `isSubmitting` etc. This state is synced with parent and child forms. Can be set with [`setState()`](/docs/FormState#setstatenewstate).

See [`useForm`](/docs/useForm) for a guide on how to create custom form state.

#### `dirty` **(readonly)**

Has any field in this form been modified?

#### `error` **(readonly)**

Is there any error in this form?

#### `validateOnChange`

Validate on value change?

#### `validator`

The form's validator.

## Functions

#### `setValue(name, value, validate = true, isDefault = false)`

Sets a field value or default value.

-   `name` **(required)**: The field name to set a value for.
-   `value` **(required)**: The new value for the field.
-   `validate` **(optional)**: Validate? When defined, overrides `validateOnChange`.
-   `isDefault` **(optional, false)**: When true, updates the default value instead of the normal value.

#### `setValues(values, validate = true, isDefault = false, notifyChild = true, notifyParent = true)`

Sets values _OR_ default values for a form.

-   `values` **(required)**: The new values/default values to set on this form.
-   `validate` **(optional)**: Validate? When defined, overrides `validateOnChange`.
-   `isDefault` **(optional, false)**: When true, updates the default values instead of the normal values. Only updates one or the other, to set both at the same time, use `setDefaultValues()` or 2 function calls.

#### `setDefaultValues(values, validate = true, notifyChild = true, notifyParent = true)`

Set both values _AND_ default values for a form. If you only want to set default values, use `setValues(...,...,true)`.

-   `values` **(required)**: The new values to set on this form.
-   `validate` **(optional)**: Validate? When defined, overrides `validateOnChange`.

#### `validate()`

Force validation on this form. Required when `validateOnChange` is disabled. Takes no parameters.

#### `setError(name, error, notifyChild = true, notifyParent = true)`

Set an error on a specific field in this form.

-   `name` **(required)**: The field name to set an error on.
-   `error` **(required)**: The error to set.

#### `setErrors(errors, notifyChild = true, notifyParent = true)`

Set all the errors on this form and child forms.

-   `errors` **(required)**: The new errors for this form. Use {} to clear errors. **The format of this error object must follow the same structure of the values object, but each value is replaced by its error.**

#### `resetAll(validate = true, notifyChild = true, notifyParent = true)`

Resets the values in this form to the default values. Causes validation.

#### `reset(name, validate = true, notifyChild = true, notifyParent = true)`

Reset a specific field in this form to its default value.

-   `name` **(required)**: The field to reset to its default value.

#### `setState(newState)`

Updates the state of this form, this causes every input to rerender. This also updates the state in parent and child forms **by default**.

-   `newState` **(required)**: The new form state.

### notifyChild/notifyParent parameters **(Advanced)**

A lot of functions have the parameters `notifyChild/notifyParent`, these parameters tells the form if the action that was just done has to notify parent or child forms. **Parent and child forms are always notified by default**

This can be useful if you only want to reset a child form, but not its parent form. In this case you would use `notifyParent = false` in `resetAll(true, false)`.

## ChildFormState

ChildFormState inherits from FormState, and provides these additional properties:

#### `parent`

The parent form of this form. Which is a `FormState` or `ChildFormState` instance.

#### `name`

The name of this form, which is the name of the field in the parent form which this child form represents.
