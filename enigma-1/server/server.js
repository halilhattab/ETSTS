const express = require("express");
const fs = require("fs");
const session = require("express-session");
const cors = require("cors");
const mysql = require("mysql2");
const WebSocket = require("ws");
const http = require("http");

const app = express();
const PORT = 5000;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "ETSTS",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL bağlantı hatası:", err);
    return;
  }
  console.log("MySQL bağlantısı başarılı!");
});

// Middleware
app.use(express.json());
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 },
  })
);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Create HTTP server
const server = http.createServer(app);

// Attach WebSocket server to the HTTP server
const wss = new WebSocket.Server({ server });
const clients = new Set();

wss.on("connection", (ws) => {
  console.log("WebSocket bağlantısı kuruldu!");
  clients.add(ws);

  ws.on("message", (message) => {
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.type === "fetchRecords") {
      const query = "SELECT * FROM Kayitlar";
      db.query(query, (err, results) => {
        if (err) {
          console.error("Veritabanı hatası:", err);
          ws.send(
            JSON.stringify({ type: "error", message: "Veritabanı hatası." })
          );
          return;
        }
        ws.send(JSON.stringify({ type: "records", data: results }));
      });
    }
  });

  ws.on("close", () => {
    console.log("WebSocket bağlantısı kapatıldı.");
    clients.delete(ws);
  });

  ws.on("error", (error) => {
    console.error("WebSocket Hatası:", error);
  });
});

// API routes
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Kullanıcı adı ve şifre gereklidir." });
  }

  const query = "SELECT * FROM users WHERE username = ? AND upassword = ?";
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error("Veritabanı hatası:", err);
      return res.status(500).json({ message: "Sunucu hatası." });
    }

    if (results.length === 0) {
      return res
        .status(401)
        .json({ message: "Geçersiz kullanıcı adı veya şifre." });
    }

    req.session.user = results[0];
    res.json({ message: "Giriş başarılı!", user: results[0] });
  });
});

app.get("/api/record/:fisNo", (req, res) => {
  const fisNo = req.params.fisNo;

  const query = "SELECT * FROM Kayitlar WHERE FisNo = ?";
  db.query(query, [fisNo], (err, results) => {
    if (err) {
      console.error("Veritabanı hatası:", err);
      return res.status(500).send("Sunucu hatası.");
    }

    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send("Kayıt bulunamadı.");
    }
  });
});

app.put("/api/record/:fisNo", (req, res) => {
  const fisNo = req.params.fisNo;
  const {
    AdiSoyadi,
    Telefon1,
    Telefon2,
    SeriNo,
    TeslimAlan,
    Durumu,
    Hazirlayan,
    Urun,
    Marka,
    Model,
    GarantiDurumu,
    AlimYeri,
    Sorunlar,
  } = req.body;

  const query = `
    UPDATE Kayitlar 
    SET AdiSoyadi = ?, Telefon1 = ?, Telefon2 = ?, SeriNo = ?, TeslimAlan = ?, Durumu = ?, 
        Hazirlayan = ?, TeslimAlmaTarihi = ?, TeslimAlmaSaati = ?, Urun = ?, Marka = ?, 
        Model = ?, GarantiDurumu = ?, AlimYeri = ?, Sorunlar = ?
    WHERE FisNo = ?
  `;

  db.query(
    query,
    [
      AdiSoyadi,
      Telefon1,
      Telefon2,
      SeriNo,
      TeslimAlan,
      Durumu,
      Hazirlayan,
      Urun,
      Marka,
      Model,
      GarantiDurumu,
      AlimYeri,
      Sorunlar,
      fisNo,
    ],
    (err, results) => {
      if (err) {
        console.error("Veritabanı hatası:", err);
        return res.status(500).send("Sunucu hatası.");
      }

      if (results.affectedRows > 0) {
        res.send("Kayıt başarıyla güncellendi.");
      } else {
        res.status(404).send("Kayıt bulunamadı.");
      }
    }
  );
});

// Yeni kayıt ekleme
app.post("/api/record", (req, res) => {
  const { AdiSoyadi } = req.body;

  if (!AdiSoyadi) {
    return res.status(400).json({ message: "Adı Soyadı alanı gereklidir." });
  }

  const query = "INSERT INTO Kayitlar (AdiSoyadi) VALUES (?)";
  db.query(query, [AdiSoyadi], (err, results) => {
    if (err) {
      console.error("Veritabanı hatası:", err);
      return res.status(500).json({ message: "Sunucu hatası." });
    }

    res.status(201).json({
      message: "Kayıt başarıyla eklendi!",
      recordId: results.insertId,
    });
  });
});
// Start the server
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
