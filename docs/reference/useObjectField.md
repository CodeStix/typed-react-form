---
layout: default
parent: Reference
title: useObjectField hook
nav_order: 100
---

# `useObjectField`

Creates a form based on another form's field. Use this with nested objects. This hook does not cause a rerender.

This hook must be called, unconditionally, at the start of your component, just like the normal React hooks.

**If your field can/will be null or undefined**, you should use the [`ObjectField`](/typed-react-form/reference/ObjectField) component instead, which does not render when the field is null/undefined.

`useObjectField(parentForm, name)`

## Parameters

#### `parentForm` **(required)**

The parent form that contains the field to create a child form for.

#### `name` **(required)**

The name of a field in the parent form to create a child form for.

## Returns

A [`ChildFormState`](/typed-react-form/reference/FormState) object.

## Usage

See [Object fields](/typed-react-form/advanced/Object-fields) for useful examples.
