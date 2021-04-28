---
layout: default
parent: Reference
title: useArrayField hook
nav_order: 100
---

# `useArrayField`

A hook that provides array manipulation functions and optimizations for an array field. This is the array-optimized version of [`useObjectField`](/typed-react-form/reference/useObjectField). This hook only causes a rerender when the array size changes (this is why `values.map((e) => ...)` works when adding/removing a value).

This hook must be called, unconditionally, at the start of your component, just like the normal React hooks.

**If your array field can/will be null or undefined**, you should use the [`ArrayField`](/typed-react-form/reference/ArrayField) component instead, which does not render when the array is null/undefined.

`useArrayField(parentForm, nameOfArrayField)`

## Parameters

#### `parentForm` **(required)**

The parent form which contains the array field to create a array child form for.

#### `name` **(required)**

The name of the array field in the parent form.

## Returns

An object, containing the following fields:

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

See [Array fields](/typed-react-form/advanced/Array-fields) for useful examples.
