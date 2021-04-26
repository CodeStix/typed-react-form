export * from "./FormInput";
export * from "./FormSelect";
export * from "./FormTextArea";
export * from "./FormError";
export * from "./serializer";

export type StyledFix<T, Props = {}> = T | ((props: Props) => JSX.Element);
