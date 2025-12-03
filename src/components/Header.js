import React from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";

const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          樂透模擬器
        </Typography>
        <Button color="inherit" component={Link} to="/">
          主頁
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
