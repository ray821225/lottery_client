import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import LottoPage from "./components/LottoPage";
import Container from "@mui/material/Container";

const App = () => {
  return (
    <Router>
      <Header />
      <Container>
        <Routes>
          <Route path="/" element={<LottoPage />} />
          {/* <Route path="/ai-predict" element={<AIPredictPage />} /> */}
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
