<h1 align="center" width="100%">
    Typed React form
</h1>

<p align="center" width="100%">
    <img src="https://github.com/CodeStix/typed-react-form/raw/master/docs/images/thumbextrasmall.png"> 
</p>

<p align="center" width="100%">
    <a href="https://www.npmjs.com/package/typed-react-form"><img alt="NPM" src="https://img.shields.io/npm/v/typed-react-form.svg" /></a>
    <a href="https://bundlephobia.com/result?p=typed-react-form"><img alt="NPM Size" src="https://img.shields.io/bundlephobia/minzip/typed-react-form" /></a>
</p>

<p align="center" width="100%">
    <strong>A completely type-checked form builder for React with Typescript</strong>
</p>

- ✔️ **Type-checked**: Make less errors, even field names are strongly typed.
- 🤔 **Simple**: A well [documented](https://codestix.github.io/typed-react-form/), intuitive and easy to understand api. 
- :fire: **Fast**: Only rerenders the fields that change if used correctly. This allows you to create huge forms.
- 📦 **Pretty Small**: [![NPM Size](https://img.shields.io/bundlephobia/minzip/typed-react-form)](https://bundlephobia.com/result?p=typed-react-form)

## Install

```  
npm install typed-react-form
```

## [Documentation here](https://codestix.github.io/typed-react-form/)

## Typescript demos

### Type-checked field names
![type-checked field names](https://github.com/CodeStix/typed-react-form/raw/master/docs/images/demo-example.gif)

### Type-checked custom inputs
![type-checked custom inputs](https://github.com/CodeStix/typed-react-form/raw/master/docs/images/demo-custom.gif)

### Type-checked object/array fields
![type-checked object/array fields](https://github.com/CodeStix/typed-react-form/raw/master/docs/images/demo-objectfield.gif)

## Javascript/typescript React

This library is built from the ground up for React with typescript, but it also works with with vanilla React, without enforced type checking.

## Contributing

Contributions are welcome.

1. Clone this repo.
2. Install deps using `yarn`. Yarn is required because of the resolutions field in package.json, npm does not support this.
3. Run `yarn start`, this will watch source files in `src/` and rebuild on change.
4. Open a new terminal and navigate to `testing/`, run `yarn` and `yarn start` to start the testing application.
5. Done! When you edit source code, it will be rebuilt and update the testing application.

## License

MIT © [Stijn Rogiest](https://github.com/CodeStix)
