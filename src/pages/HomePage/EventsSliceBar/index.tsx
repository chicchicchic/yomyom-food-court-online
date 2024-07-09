import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; // Import slick carousel styles
import "slick-carousel/slick/slick-theme.css"; // Import theme for slick carousel
import { makeStyles } from "@mui/styles";

interface EventsSliceBarProps {
  // Add any props you might need for the component here
}

const useStyles = makeStyles({
  sliderImage: {
    height: "200px",
    maxHeight: "300px",
    width: "100%",
    // objectFit: "cover",
    "@media (min-width: 376px)": {
        height: "300px",
    },
  },
});

const EmptyArrow: React.FC = () => {
  return null;
};

const EventsSliceBar: React.FC<EventsSliceBarProps> = (props) => {
  const classes = useStyles();

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <EmptyArrow />,  // Use empty component here
    prevArrow: <EmptyArrow />,  // Use empty component here
  };

  const list = [
    {name: "e1", image: "/images/HomePage/IntroEventImages/e1.jpg"},
    {name: "e2", image: "/images/HomePage/IntroEventImages/e2.png"},
    {name: "e3", image: "/images/HomePage/IntroEventImages/e3.jpg"},
    {name: "e4", image: "/images/HomePage/IntroEventImages/e4.jpg"},
    {name: "e5", image: "/images/HomePage/IntroEventImages/e5.jpg"},
  ]

  return (
    <div  style={{ marginBottom: "1rem" }}>
      <Slider {...settings}>
        {list && list.map((item, index) => (
          <div key={index} className="card card-slider">
            <img
              src={item.image}
              alt={item.name}
              className={`${classes.sliderImage}`}
            />
          </div>
        ))}


      </Slider>
    </div>
  );
};

export default EventsSliceBar;
