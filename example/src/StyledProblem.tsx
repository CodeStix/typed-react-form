import React from "react";
import styled from "styled-components";
import { FormInput, useForm } from "typed-react-form";

const Form = styled.form`
    background: #0001;
`;

export function StyledForm() {
    const form = useForm({ name: "", email: "" });

    return (
        <Form>
            <FormInput form={form} name="name" />
            <FormInput form={form} name="email" />
        </Form>
    );
}
