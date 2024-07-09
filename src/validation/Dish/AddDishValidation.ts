import * as Yup from "yup";

export const addDishSchema = Yup.object().shape({
  name: Yup.string()
    .required("Dish name is required")
    .min(1, "Dish name must be at least 1 character long")
    .max(100, "Dish name cannot exceed 100 characters"),
  originalPrice: Yup.number()
    .required("Original price is required")
    .positive("Original price must be greater than $0")
    .min(1.0, "Original price must be at least $1")
    .max(5000.0, "Original price cannot exceed $5000"),
  discount: Yup.number()
    .required("Discount is required")
    .min(0.0, "Discount must be greater than or equal to 0%")
    .max(100.0, "Discount cannot exceed 100%"),
  preparationTime: Yup.number()
    .required("Preparation time is required")
    .min(20, "Preparation time must be at least 20 minutes")
    .max(200, "Preparation time cannot exceed 200 minutes"),
  mealSet: Yup.string()
    .required("Meal set is required")
    .min(1, "Meal set must be at least 1 character long")
    .max(1000, "Meal set cannot exceed 1000 characters"),
  image: Yup.mixed()
    .required("Image is required"),
  categoryEnum: Yup.string()
    .required("Category is required"),
});
