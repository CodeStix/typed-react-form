import { Validator } from "./form";

// yup type stubs
interface YupValidationError {
    path?: string;
    message?: string;
    inner: YupValidationError[];
}
interface YupValidationOptions {
    strict?: boolean;
    abortEarly?: boolean;
    stripUnknown?: boolean;
    recursive?: boolean;
    context?: any;
}

export function yupValidator<T, Error>(yupSchema: any, options?: YupValidationOptions, messageTransformer: (message: string) => Error = (e) => e as any): Validator<T, Error> {
    return async (values: T) => {
        try {
            await yupSchema.validate(values, options);
            return {};
        } catch (ex) {
            return yupErrorToErrorMap(ex, messageTransformer);
        }
    };
}

export function yupErrorToErrorMap<Error>(error: YupValidationError, errorTransformer: (message: string) => Error) {
    let errors = error.path ? [error] : error.inner;
    let obj = {};
    for (let i = 0; i < errors.length; i++) {
        let err = errors[i];
        if (!err.path || !err.message) continue;
        let pathSegments = Array.from(err.path.matchAll(/(\w+)/gi)).map((e) => e[0]);
        let o = obj;
        for (let j = 0; j < pathSegments.length; j++) {
            let key = pathSegments[j];
            let oo = o[key];
            if (!oo) {
                oo = {};
                o[key] = oo;
            }
            if (j === pathSegments.length - 1) {
                o[key] = errorTransformer(err.message);
            } else {
                o = oo;
            }
        }
    }
    return obj;
}
