import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";


export default function WeatherApp() {
  const [lat, setLat] = useState("13.7563");
  const [lon, setLon] = useState("100.5018");
  const [temp, setTemp] = useState(null);
  const [addr, setAddr] = useState("");
  const [message, setMessage] = useState(null);
  const [locations, setLocations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // Read: ดึงข้อมูลทั้งหมด
  const readLocations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "addresses"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLocations(data);
    } catch (error) {
      setMessage({ type: "error", text: "ดึงข้อมูลล้มเหลว: " + error.message });
    }
  };

  useEffect(() => {
    readLocations();
  }, []);

  // Create: เพิ่มสถานที่ใหม่
  const addAddress = async () => {
    if (!addr.trim()) {
      setMessage({ type: "error", text: "กรุณากรอกชื่อสถานที่" });
      return;
    }
    if (!email.trim() || !username.trim()) {
      setMessage({ type: "error", text: "กรุณากรอกชื่อผู้ใช้และอีเมล" });
      return;
    }
    try {
      await addDoc(collection(db, "addresses"), {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        address: addr.trim(),
        username: username,
        email: email,
        currentTemp: temp || null,
        timestamp: serverTimestamp(),
      });
      setMessage({
        type: "success",
        text: `เพิ่ม "${addr}" สำหรับ ${username} และ ${email} สำเร็จ!`,
      });
      setAddr("");
      setUsername("");
      setEmail("");
      readLocations();
    } catch (e) {
      console.error("Error adding document: ", e);
      setMessage({ type: "error", text: "เกิดข้อผิดพลาด: " + e.message });
    }
  };

  // Update: แก้ไขชื่อสถานที่
  const updateAddress = async () => {
    if (!editName.trim()) {
      setMessage({ type: "error", text: "กรุณากรอกชื่อใหม่" });
      return;
    }

    try {
      const locationRef = doc(db, "addresses", editingId);
      await updateDoc(locationRef, {
        address: editName.trim(),
        username: username,
        email: email,
        timestamp: serverTimestamp(),
      });
      setMessage({ type: "success", text: "แก้ไขข้อมูลสำเร็จ!" });
      setEditingId(null);
      setEditName("");
      setUsername("");
      setEmail("");
      readLocations(); // โหลดใหม่
    } catch (e) {
      console.error("Error updating document: ", e);
      setMessage({ type: "error", text: "แก้ไขล้มเหลว: " + e.message });
    }
  };

  // Delete: ลบสถานที่
  const deleteAddress = async (id) => {
    try {
      await deleteDoc(doc(db, "addresses", id));
      setMessage({ type: "success", text: "ลบข้อมูลสำเร็จ!" });
      readLocations(); // โหลดใหม่
    } catch (e) {
      console.error("Error deleting document: ", e);
      setMessage({ type: "error", text: "ลบล้มเหลว: " + e.message });
    }
  };

  // อัปเดตอุณหภูมิของสถานที่นั้น
  const updateLocationTemp = async (id, latitude, longitude) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const data = await res.json();
      const locationRef = doc(db, "addresses", id);
      await updateDoc(locationRef, {
        currentTemp: data.current_weather.temperature,
        timestamp: serverTimestamp(),
      });
      setMessage({ type: "success", text: "อัปเดตอุณหภูมิสำเร็จ!" });
      fetchLocations();
    } catch (e) {
      console.error("Error updating temperature: ", e);
      setMessage({ type: "error", text: "อัปเดตล้มเหลว: " + e.message });
    }
  };

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
        background: "linear-gradient(135deg, #e0e7ff 0%, #f9fafc 100%)",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        p: 2,
        fontFamily: "'Segoe UI', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background cloud */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: 20, md: 60 },
          left: { xs: 10, md: 80 },
          zIndex: 0,
          opacity: 0.15,
          fontSize: { xs: "6rem", md: "12rem" },
          pointerEvents: "none",
          animation: "floatCloud 8s ease-in-out infinite",
        }}
      >
        ☁️
      </Box>
      {/* Main Content */}
      <Box sx={{ display: "flex", flex: 1, zIndex: 1 }}>
        {/* ฟอร์มและอุณหภูมิ */}
        <Paper
          elevation={3}
          sx={{
            width: { xs: "100%", md: "50%" },
            maxWidth: 420,
            p: 4,
            borderRadius: 6,
            bgcolor: "rgba(255,255,255,0.95)",
            textAlign: "center",
            mr: { md: 3 },
            mb: { xs: 3, md: 0 },
            boxShadow: "0 4px 24px 0 rgba(59,130,246,0.08)",
            backdropFilter: "blur(2px)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              color="#3b82f6"
              sx={{ mr: 1 }}
            >
              <span style={{ filter: "drop-shadow(0 2px 6px #3b82f6)" }}>
                ☁️
              </span>
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="grey.800">
              สภาพอากาศที่ไหน
            </Typography>
            <Typography variant="caption" color="grey.500" sx={{ ml: 1 }}>
              made by ekawich
            </Typography>
          </Box>

          {/* Inputs */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
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
                  "&:hover fieldset": { borderColor: "#6366f1" },
                  "&.Mui-focused fieldset": { borderColor: "#6366f1" },
                  borderRadius: 3,
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
                  "&:hover fieldset": { borderColor: "#6366f1" },
                  "&.Mui-focused fieldset": { borderColor: "#6366f1" },
                  borderRadius: 3,
                },
              }}
            />
          </div>

          {/* Address Input */}
          <TextField
            label="ชื่อสถานที่"
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            fullWidth
            size="small"
            variant="outlined"
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#6366f1" },
                "&.Mui-focused fieldset": { borderColor: "#6366f1" },
                borderRadius: 3,
              },
            }}
          />

          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <TextField
              label="ชื่อผู้ใช้"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": { borderColor: "#6366f1" },
                  "&.Mui-focused fieldset": { borderColor: "#6366f1" },
                  borderRadius: 3,
                },
              }}
            />
            <TextField
              label="อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": { borderColor: "#6366f1" },
                  "&.Mui-focused fieldset": { borderColor: "#6366f1" },
                  borderRadius: 3,
                },
              }}
            />
          </div>
          {/* Buttons */}
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Button
              onClick={getWeather}
              variant="contained"
              sx={{
                bgcolor: "linear-gradient(90deg,#3b82f6 60%,#6366f1 100%)",
                color: "white",
                py: 1.2,
                textTransform: "none",
                fontWeight: "bold",
                borderRadius: 3,
                boxShadow: "0 2px 8px 0 rgba(59,130,246,0.12)",
                "&:hover": { bgcolor: "#6366f1" },
                flex: 1,
              }}
            >
              🔍 ดูอุณหภูมิ
            </Button>
            <Button
              onClick={addAddress}
              variant="outlined"
              sx={{
                color: "#6366f1",
                borderColor: "#6366f1",
                py: 1.2,
                textTransform: "none",
                fontWeight: "bold",
                borderRadius: 3,
                "&:hover": { bgcolor: "#eef2ff" },
              }}
            >
              💾 บันทึก
            </Button>
          </Box>

          {/* Message Alert */}
          {message && (
            <Alert
              severity={message.type}
              sx={{ mb: 2, borderRadius: 2, fontWeight: "bold" }}
              onClose={() => setMessage(null)}
            >
              {message.text}
            </Alert>
          )}

          {/* Temperature Display */}
          {temp !== null && (
            <Box
              sx={{
                mt: 2,
                p: 3,
                borderRadius: 6,
                bgcolor: "linear-gradient(90deg,#dbeafe 60%,#f0f9ff 100%)",
                border: "1px solid #bfdbfe",
                boxShadow: "0 2px 8px 0 rgba(59,130,246,0.08)",
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
                  fontSize: { xs: "3.5rem", sm: "4.5rem" },
                  lineHeight: 1,
                  letterSpacing: "-1px",
                  textShadow: "0 2px 12px #93c5fd",
                }}
              >
                {temp}°C
              </Typography>
            </Box>
          )}
        </Paper>

        {/* แสดงรายการสถานที่ (CRUD) */}
        <Paper
          elevation={3}
          sx={{
            width: { xs: "100%", md: "50%" },
            p: 4,
            borderRadius: 6,
            bgcolor: "rgba(255,255,255,0.95)",
            maxHeight: "100vh",
            overflowY: "auto",
            boxShadow: "0 4px 24px 0 rgba(59,130,246,0.08)",
            backdropFilter: "blur(2px)",
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="grey.800" mb={2}>
            สถานที่ที่บันทึกไว้{" "}
            <span style={{ color: "#6366f1" }}>({locations.length})</span>
          </Typography>

          {editingId ? (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="แก้ไขชื่อ"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                size="small"
                sx={{
                  mb: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                  },
                }}
              />
              <TextField
                label="ชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                size="small"
                sx={{
                  mb: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                  },
                }}
              />

              <TextField
                label="อีเมล"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                size="small"
                sx={{
                  mb: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                  },
                }}
              />

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  onClick={updateAddress}
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  บันทึก
                </Button>
                <Button
                  onClick={() => setEditingId(null)}
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  ยกเลิก
                </Button>
              </Box>
            </Box>
          ) : null}

          <List dense>
            {locations.map((loc) => (
              <ListItem
                key={loc.id}
                secondaryAction={
                  <Box>
                    <Button
                      size="small"
                      onClick={() =>
                        updateLocationTemp(loc.id, loc.latitude, loc.longitude)
                      }
                      sx={{
                        mr: 1,
                        fontSize: "0.85rem",
                        color: "#6366f1",
                        borderRadius: 2,
                        bgcolor: "#eef2ff",
                        "&:hover": { bgcolor: "#dbeafe" },
                      }}
                    >
                      🔄 อัปเดต
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setEditingId(loc.id);
                        setEditName(loc.address);
                        setUsername(loc.username);
                        setEmail(loc.email);
                      }}
                      sx={{
                        mr: 1,
                        fontSize: "0.85rem",
                        color: "#3b82f6",
                        borderRadius: 2,
                        bgcolor: "#f0f9ff",
                        "&:hover": { bgcolor: "#dbeafe" },
                      }}
                    >
                      ✏️ แก้ไข
                    </Button>
                    <Button
                      size="small"
                      onClick={() => deleteAddress(loc.id)}
                      color="error"
                      sx={{
                        fontSize: "0.85rem",
                        borderRadius: 2,
                        bgcolor: "#fee2e2",
                        "&:hover": { bgcolor: "#fecaca" },
                      }}
                    >
                      🗑️ ลบ
                    </Button>
                  </Box>
                }
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 3,
                  mb: 1.5,
                  bgcolor: "#f9fafc",
                  boxShadow: "0 1px 4px 0 rgba(59,130,246,0.04)",
                  transition: "box-shadow 0.2s",
                  "&:hover": {
                    boxShadow: "0 4px 16px 0 rgba(59,130,246,0.10)",
                    bgcolor: "#f0f9ff",
                  },
                }}
              >
                <div>
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#6366f1",
                      fontSize: "1.1rem",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {loc.username} อยู่ที่
                  </span>
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#6366f1",
                      fontSize: "1.1rem",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {loc.address}
                  </span>
                  <div
                    style={{
                      color: "#6366f1",
                      fontWeight: "bold",
                      fontSize: "15px",
                    }}
                  >
                    Contact : {loc.email}
                  </div>
                  <ListItemText
                    secondary={
                      loc.currentTemp ? (
                        <span style={{ color: "#2563eb" }}>
                          อุณหภูมิ :
                          <span
                            style={{
                              color: "#2563eb",
                              fontWeight: "bold",
                              paddingLeft: 5,
                            }}
                          >
                            {loc.currentTemp}°C
                          </span>
                        </span>
                      ) : (
                        <span style={{ color: "#64748b" }}>
                          ยังไม่มีข้อมูลอุณหภูมิ
                        </span>
                      )
                    }
                  />
                  <ListItemText
                    secondary={
                      loc.currentTemp ? (
                        <span style={{ color: "#64748b" }}>
                          อัปเดตเมื่อ:{" "}
                          {loc.timestamp?.toDate
                            ? loc.timestamp.toDate().toLocaleString()
                            : "N/A"}
                        </span>
                      ) : (
                        ""
                      )
                    }
                  />
                </div>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
      {/* CSS animation for cloud */}
      <style>
        {`
          @keyframes floatCloud {
            0% { transform: translateY(0px);}
            50% { transform: translateY(30px);}
            100% { transform: translateY(0px);}
          }
        `}
      </style>
    </Box>
  );
}
