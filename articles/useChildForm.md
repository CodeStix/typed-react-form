Creates a form based on another form's field. Use this with nested objects. This hook does not cause a rerender. 

**If your field can/will be null or undefined**, you should use the [`ChildForm`](https://github.com/CodeStix/typed-react-form/wiki/ChildForm) component instead, which does not render when the field is null/undefined.

`useChildForm(parentForm, name)`

## Parameters

#### `parentForm` **(required)**

The parent form that contains the field to create a child form for.

---

#### `name` **(required)**

The name of a field in the parent form to create a child form for.

## Returns

A [`ChildFormState`](https://github.com/CodeStix/typed-react-form/wiki/FormState) object.

## Usage

See [Object fields](https://github.com/CodeStix/typed-react-form/wiki/Object-fields) for useful examples.
