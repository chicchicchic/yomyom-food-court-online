import * as Yup from "yup";

export const contactSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(1, "Fullname must be at least 1 characters")
    .max(20, "Fullname cannot exceed 20 characters")
    .required("Fullname is required"),
  phone: Yup.string()
    .matches(/^\d{10,11}$/, "Phone number must be 10 or 11 digits")
    .required("Phone number is required"),
  email: Yup.string()
    .email("Invalid email")
    .matches(/^[A-Za-z0-9+_.-]+@(.+)$/, "Invalid email format")
    .required("Email is required"),
  title: Yup.string()
    .min(5, "Title must be at least 5 characters")
    .max(20, "Title cannot exceed 20 characters")
    .required("Title is required"),
  content: Yup.string()
    .min(5, "Content must be at least 5 characters")
    .max(255, "Content cannot exceed 255 characters")
    .required("Content is required"),
});
