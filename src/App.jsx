import React, { useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";

export default function WeatherApp() {
  const [lat, setLat] = useState("13.7563");
  const [lon, setLon] = useState("100.5018");
  const [temp, setTemp] = useState(null);

  const getWeather = async () => {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    const data = await res.json();
    setTemp(data.current_weather.temperature);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        background: "#f9fafc", 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        m: 0,
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 3,
          borderRadius: 5,
          border: "1px solid #e5e7eb",
          bgcolor: "white",
          textAlign: "center",
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" color="#3b82f6" sx={{ mr: 1 }}>
            ☁️
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="grey.800">
            สภาพอากาศที่ไหน
          </Typography>
          <Typography variant="caption" color="grey.500" sx={{ ml: 1 }}>
            made by ekawich
          </Typography>
        </Box>

        {/* Inputs */}
        <TextField
          label="ละติจูด (Latitude)"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          fullWidth
          size="small"
          variant="outlined"
          sx={{
            mb: 1.5,
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": { borderColor: "#3b82f6" },
              "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
              'borderRadius': 2,
            },
          }}
        />

        <TextField
          label="ลองจิจูด (Longitude)"
          value={lon}
          onChange={(e) => setLon(e.target.value)}
          fullWidth
          size="small"
          variant="outlined"
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": { borderColor: "#3b82f6" },
              "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
            'borderRadius': 2,
            },
          }}
        />

        {/* Search Button */}
        <Button
          onClick={getWeather}
          variant="contained"
          fullWidth
          sx={{
            bgcolor: "#3b82f6",
            color: "white",
            py: 1.5,
            textTransform: "none",
            fontWeight: "bold",
            borderRadius: 5,
            "&:hover": { bgcolor: "#2563eb" },
          }}
        >
          🔍 ค้นหาสภาพอากาศ
        </Button>

        {/* Temperature Display */}
        {temp !== null && (
          <Box
            sx={{
              mt: 3,
              p: 3,
              borderRadius: 5,
              bgcolor: "#dbeafe", 
              border: "1px solid #bfdbfe",
            }}
          >
            <Typography variant="body2" color="grey.600" sx={{ mb: 1 }}>
              อุณหภูมิปัจจุบัน
            </Typography>
            <Typography
              variant="h1"
              fontWeight="light"
              color="#2563eb"
              sx={{
                fontSize: { xs: "3rem", sm: "4rem" },
                lineHeight: 1,
                letterSpacing: "-1px",
              }}
            >
              {temp}°C
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}