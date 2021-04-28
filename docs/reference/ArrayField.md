---
layout: default
parent: Reference
title: ArrayField component
nav_order: 100
---

# `<ArrayField />`

A component that provides array manipulation functions and optimizations. This is a wrapper around [`useArrayField`](/typed-react-form/reference/useArrayField). The only difference is that this component does not render its content when the array is null/undefined ([is togglable](/typed-react-form/advanced/Toggling-a-field)).

## Props

#### `form` **(required)**

The parent form which contains the array field to create a array child form for.

#### `name` **(required)**

The name of the array field in the parent form.

#### `render` **(required)**

A function that renders the array.

The render function provides an object parameter, containing the following fields:

-   `form`: The child form associated with this array. Pass this to this child forms and input elements.
-   `values`: The array, you should `{map((e) => ...)}` this.
-   `setValues(values)`: A function to update all the array values at once.

**The object also contains helper functions to quickly manipulate the array field:**

-   `remove(index)`: Function that removes a specific item at index in the array.
-   `clear()`: Function that clears the array.
-   `move(from, to)`: Function that moves an item in the array
-   `swap(index, newIndex)`: Function that swaps 2 items in the array.
-   `append(value)`: Function that appends an item to the end of the array.

## Usage

See [Array fields](/typed-react-form/advanced/Array-fields).
