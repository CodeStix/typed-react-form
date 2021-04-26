# ChildForm

Use the `ChildForm` component if you want to make fields inside an object field available to inputs. This is a wrapper around [`useChildForm`](/docs/useChildForm).

## Props

#### `form` (required)

The parent form which contains the object field to create a child form for.

#### `name` (required)

The name of the field in the parent form to create

#### `render` (required)

A function that renders, and creates inputs for the child form, which is passed as a parameter.

## Advanced

You can also use this component on array fields (index as name), but [`ArrayForm`](/docs/ArrayForm) or [`useArrayForm`](/docs/useArrayForm) is preferred when you want to create [dynamic array fields](/docs/Array-fields). It provides useful array manipulation functions and optimizations.

This component does not render its content when the form is empty (happens when its parent field has been assigned `null`, `undefined` or `{}`).
