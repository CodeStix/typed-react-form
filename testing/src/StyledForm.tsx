import React from "react";
import styled from "styled-components";
import { FormError, FormInput, StyledFix, useForm } from "typed-react-form";
import tv, { SchemaType } from "typed-object-validator";

// https://github.com/styled-components/styled-components/issues/1349#issuecomment-375293558

const Container = styled.div`
    height: 100vh;
    /* background: #0001; */
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Title = styled.div`
    padding: 1.5rem;
    border-bottom: 1px solid #0002;
    font-size: 1.3rem;
    font-weight: bold;
`;

const FormContainer = styled.div`
    background: white;
    border-radius: 0.25em;
    box-shadow: 3px 3px 15px 3px #0002;

    min-width: 300px;
`;

const Form = styled.form`
    padding: 1.5em;
    display: grid;
    gap: 0.8em;
    align-items: center;
    grid-template-columns: 100px 1fr;
`;

const StyledButton = styled.button`
    cursor: pointer;
    appearance: none;
    padding: 0.5em 1em;
    background: #e22;
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 0.3em;
    font-size: inherit;
    font-family: inherit;
    transition: 100ms;

    &:hover {
        transition: 100ms;
        background: #e22d;
    }
`;

// Must specify type explicitly
const StyledInput: StyledFix<typeof FormInput> = styled(FormInput)`
    border: 2px solid #0002;
    border-radius: 0.3em;
    padding: 0.5em;
    outline: none;

    &.typed-form-error {
        border-color: red;
    }

    &.typed-form-dirty {
        border-color: #0005;
    }
`;

// You can also just use typeof without StyledFix, but this does not support additional styled properties
const StyledError: typeof FormError = styled(FormError)`
    font-weight: bold;
    color: red;
    margin: 0.1em 0;
    grid-column: 2;
`;

const FormDataSchema = tv.object({
    name: tv.string().min(1),
    email: tv.email("Invalid email").min(1)
});
type FormData = SchemaType<typeof FormDataSchema>;

export function StyledForm() {
    const form = useForm<FormData>({ name: "", email: "" }, (values) => FormDataSchema.validate(values) ?? ({} as any));

    function submit() {
        console.log(form.values);
        alert(JSON.stringify(form.values, null, 2));
    }

    return (
        <Container>
            <FormContainer>
                <Title>
                    Form using <a href="https://styled-components.com/">styled-components</a>
                </Title>
                <Form onSubmit={form.handleSubmit(submit)}>
                    <label>Name</label>
                    <StyledInput form={form} name="name" />
                    <StyledError form={form} name="name" />
                    <label>Email</label>
                    <StyledInput form={form} name="email" />
                    <StyledError form={form} name="email" />
                    <StyledButton type="submit" style={{ gridColumn: "span 2" }}>
                        Submit
                    </StyledButton>
                </Form>
            </FormContainer>
        </Container>
    );
}
