import React from 'react';
import { makeStyles } from '@mui/styles';
import { Container, Grid, Typography, Link, Button } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: '#333',
    color: '#ffffff',
    padding: "1rem 0",
    marginTop: "2rem"
  },
  leftSection: {
    textAlign: 'left',
  },
  rightSection: {
    textAlign: 'center',
  },
}));

const Footer: React.FC = () => {
  const classes = useStyles();

  return (
    <footer className={classes.root}>
      <Container>
        <Grid container spacing={6}>
          {/* Right Section - About Us */}
          <Grid item xs={12} sm={7} md={6} lg={6} className={classes.leftSection}>
            <Button variant="outlined" sx={{ marginBottom: "1rem", color: "white", borderColor: '#D0D3D4', '&:hover': {
                  borderColor: "white",
                } }}>About Us</Button>

            <Typography variant="body1">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla fringilla felis sit amet metus tempor, sit amet
              posuere mi lobortis.
            </Typography>
          </Grid>

          {/* Left Section - Connect with Us */}
          <Grid item xs={12} sm={5} md={6} lg={6} className={classes.rightSection}>
            <Typography variant="h6" gutterBottom>
              Follow Us
            </Typography>

            <div>
                <Link href="#" color="inherit" underline="hover" style={{ marginRight: '1rem' }}>
                    <GitHubIcon fontSize='large'/>
                </Link>
                <Link href="#" color="inherit" underline="hover" style={{ marginRight: '1rem' }}>
                    <LinkedInIcon fontSize='large'/>
                </Link>
                <Link href="#" color="inherit" underline="hover" style={{ marginRight: '1rem' }}>
                    <FacebookIcon fontSize='large'/>
                </Link>
                <Link href="#" color="inherit" underline="hover" style={{ marginRight: '1rem' }}>
                    <InstagramIcon fontSize='large'/>
                </Link>
                <Link href="#" color="inherit" underline="hover">
                    <XIcon fontSize='large'/>
                </Link>
            </div>
          </Grid>
        </Grid>
      </Container>
    </footer>
  );
};

export default Footer;
