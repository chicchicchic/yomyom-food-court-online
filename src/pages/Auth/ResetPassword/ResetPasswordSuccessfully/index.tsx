import { Box, Grid } from '@mui/material'

function ResetPasswordSuccessfully() {
  return (
    <Grid container justifyContent="center">
      <Box
        component="img"
        alt="Reset Password Successfully"
        src="/images/ResetPassword/reset-password-successfully.png"
        sx={{
          width: "26rem",
          height: "14rem",
          border: "none",
        }}
      />
    </Grid>
  )
}

export default ResetPasswordSuccessfully