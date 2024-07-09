import React, { useEffect, useRef, useState } from "react";
import { getDecodeToken } from "../../utils/Auth/authUtils";
import { Button, Grid, Paper, TextField, Typography } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import PhoneIcon from "@mui/icons-material/Phone";
import emailjs from "@emailjs/browser";
import { contactSchema } from "../../validation/ContactForm/ContactValidation";
import * as Yup from "yup";

const contactMethods = [
  {
    icon: (
      <FacebookIcon sx={{ width: "3rem", height: "3rem", color: "blue" }} />
    ),
    text1: "We are happy to receive any questions from you.",
    text2: "You can contact us via Facebook.",
    link: "https://www.facebook.com/pages/Hadilao-Bitexco/1470561613079868",
  },
  {
    icon: (
      <InstagramIcon sx={{ width: "3rem", height: "3rem", color: "#e7464f" }} />
    ),
    text1: "Do you have any question ?.",
    text2: "You can contact us via Instagram.",
    link: "https://www.instagram.com/haidilao_vietnam/?hl=en",
  },
  {
    icon: (
      <PhoneIcon sx={{ width: "3rem", height: "3rem", color: "#d900b2" }} />
    ),
    text1: "Please ask if you have any questions.",
    text2: "You can call us at 028 2253 9155.",
    link: "tel:02822539177",
  },
  // Add more contact methods as needed
];

interface Contact {
  fullName: string;
  phone: string;
  email: string | null;
  title: string;
  content: string;
}

function ContactUs() {
  const decodeToken = getDecodeToken();
  let userEmail: string | null = null;
  if (decodeToken) {
    userEmail = decodeToken.sub;
  }

  const [contactForm, setContactForm] = useState<Contact>({
    fullName: "",
    phone: "",
    email: "",
    title: "",
    content: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const form = useRef<HTMLFormElement>(null);


  // [Handle] Set User Email From The Decode Token
  useEffect(() => {
    if (userEmail && userEmail !== null) {
      setContactForm((prevContactForm) => ({
        ...prevContactForm,
        email: userEmail,
      }));
    }
  }, [userEmail]);

  // [Handle] Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value,
    });
  };

  // [Handle] Submit Contact Form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await contactSchema.validate(contactForm, { abortEarly: false });

      if (form.current) {
        emailjs
          .sendForm("service_84eg9sf", "template_yb3uyh4", form.current, {
            publicKey: "VjnK1IG6BndQt80Ck",
          })
          .then(
            () => {
              // Clear Form
              setContactForm((prevContactForm) => ({
                ...prevContactForm,
                fullName: "",
                phone: "",
                title: "",
                content: "",
              }));
              setErrors({});
              alert("Your question was sent successfully !");
            },
            (error) => {
              console.log("FAILED...", error.text);
              alert("Your question cannot sent !");
            }
          );
      }
    } catch (error) {
      const validationErrors: Record<string, string> = {}; // Define type for validationErrors

      // Type assertion to tell TypeScript that error is an instance of Yup.ValidationError
      if (error instanceof Yup.ValidationError) {
        error.inner.forEach((err) => {
          const path = err.path ?? ""; // Use nullish coalescing operator to provide a default value
          validationErrors[path] = err.message;
        });
      }

      setErrors(validationErrors);
    }
  };

  
  return (
    <>
      {!userEmail ? (
        <Typography variant="h5">
          Waiting for user information to be available!
        </Typography>
      ) : (
        <>
          {/* [SECTION] Google Map */}
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7838.954812657775!2d106.69797618779307!3d10.774700347223993!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752fc152ac89bd%3A0x6e94677d89711aed!2zSGFpZGlsYW8gSHVvZ3VvIOa1t-W6leaNnueBq-mUhSBCaXRleGNv!5e0!3m2!1svi!2s!4v1719930582562!5m2!1svi!2s"
            width="100%"
            height="100%"
            style={{ border: 0, height: "14rem" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Contact Us Location" // Added a descriptive title here
          ></iframe>

          {/* [SECTION] Social Contact */}
          <Paper elevation={3} sx={{ marginTop: "2rem", position: "relative" }}>
            <Grid
              container
              spacing={2}
              justifyContent="center"
              alignItems="center"
              sx={{
                position: "relative",
                textAlign: "center",
                height: "auto", // Set height for the background image section
                backgroundImage:
                  'url("/images/ContactUs/socialMediaContactBackground.jpg")', // Replace with your image path
                backgroundSize: "cover",
                backgroundPosition: "center",
                overflow: "hidden", // Hide overflow to contain blurred image
                padding: "3rem 1rem",
              }}
            >
              {/* Overlay with blur effect */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backdropFilter: "blur(2px)", // Blur effect for overlay
                  backgroundColor: "rgba(255, 255, 255, 0.6)", // Semi-transparent white overlay
                  zIndex: 1, // Ensure overlay is above other elements
                }}
              ></div>

              {/* Content */}
              {contactMethods.map((method, index) => (
                <Grid
                  item
                  xs={12}
                  sm={4}
                  md={4}
                  key={index}
                  sx={{ zIndex: 2, marginBottom: "2rem" }}
                >
                  {/* Icon */}
                  <Grid item>{method.icon}</Grid>

                  {/* Text */}
                  <Grid item>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, fontSize: "1.2rem" }}
                    >
                      {method.text1}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, fontSize: "1.2rem" }}
                    >
                      {method.text2}
                    </Typography>
                  </Grid>

                  {/* Button */}
                  <Grid item>
                    <Button
                      variant="contained"
                      component="a"
                      href={method.link}
                      target="_blank"
                      sx={{
                        backgroundColor: "green",
                        "&:hover": {
                          backgroundColor: "#062517", // Change this to the desired hover background color
                        },
                      }}
                    >
                      Start
                    </Button>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* [SECTION] Contact From */}
          <div style={{ marginTop: "2rem", padding: "2rem" }}>
            <Typography variant="h5" gutterBottom sx={{ textAlign: "center" }}>
              Contact Us
            </Typography>

            <form ref={form} onSubmit={handleSubmit}>
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                      <TextField
                        name="fullName"
                        label="Fullname"
                        variant="outlined"
                        fullWidth
                        value={contactForm.fullName}
                        onChange={handleChange}
                        error={!!errors.fullName} // Check if error exists for the field
                        helperText={errors.fullName ?? ""} // Display error message if it exists
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={6} lg={6}>
                      <TextField
                        name="phone"
                        type="number"
                        label="Phone"
                        variant="outlined"
                        fullWidth
                        value={contactForm.phone}
                        onChange={handleChange}
                        error={!!errors.phone} // Check if error exists for the field
                        helperText={errors.phone ?? ""} // Display error message if it exists
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Readonly Email Field */}
                <Grid item xs={12}>
                  <TextField
                    name="email"
                    label="Email"
                    variant="outlined"
                    fullWidth
                    value={contactForm.email}
                    InputProps={{
                      readOnly: true,
                    }}
                    error={!!errors.email} // Check if error exists for the field
                    helperText={errors.email ?? ""} // Display error message if it exists
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="title"
                    label="Title"
                    variant="outlined"
                    fullWidth
                    value={contactForm.title}
                    onChange={handleChange}
                    error={!!errors.title} // Check if error exists for the field
                    helperText={errors.title ?? ""} // Display error message if it exists
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="content"
                    label="Content"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={contactForm.content}
                    onChange={handleChange}
                    error={!!errors.content} // Check if error exists for the field
                    helperText={errors.content ?? ""} // Display error message if it exists
                  />
                </Grid>

                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    sx={{
                      backgroundColor: "green",
                      marginTop: "1rem",
                      "&:hover": {
                        backgroundColor: "#062517",
                      },
                    }}
                  >
                    Send Question
                  </Button>
                </Grid>
              </Grid>
            </form>
          </div>
        </>
      )}
    </>
  );
}

export default ContactUs;
