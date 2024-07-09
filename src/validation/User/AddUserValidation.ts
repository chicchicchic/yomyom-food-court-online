import * as Yup from "yup";

export const addUserSchema = Yup.object().shape({
  userName: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(10, "Username cannot exceed 10 characters")
    .required("Username is required"),
  firstName: Yup.string()
    .required("First Name is required"),
  lastName: Yup.string()
    .required("Last Name is required"),
  email: Yup.string()
    .email("Invalid email")
    .matches(/^[A-Za-z0-9+_.-]+@(.+)$/, "Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .max(15, "Password cannot exceed 15 characters")
    .required("Password is required"),
  phone: Yup.string()
    .matches(/^\d{10,11}$/, "Phone number must be 10 or 11 digits")
    .required("Phone number is required"),
  dateOfBirth: Yup.date()
    .nullable() // Allow null values
    .max(new Date(), "Date of Birth must be before or equal to today")
    .required("Date of Birth is required"),
  userRoleEnum: Yup.string()
    .required("Role is required"),
});
