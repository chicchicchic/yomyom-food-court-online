import * as Yup from "yup";

export const updateUserSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("First Name is required"),
  lastName: Yup.string()
    .required("Last Name is required"),
  email: Yup.string()
    .email("Invalid email")
    .matches(/^[A-Za-z0-9+_.-]+@(.+)$/, "Invalid email format")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^\d{10,11}$/, "Phone number must be 10 or 11 digits")
    .required("Phone number is required"),
  dateOfBirth: Yup.date()
    .nullable() // Allow null values
    .min(new Date(1880, 0, 1), "Date of Birth must be after 1880")
    .max(new Date(), "Date of Birth must be before current date")
    .required("Date of Birth is required"),
  roleEnum: Yup.string()
    .required("Role is required"),
});
