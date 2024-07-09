import * as Yup from "yup";

export const signInSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email")
      .matches(/^[A-Za-z0-9+_.-]+@(.+)$/, "Invalid email format")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
});
