import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "../css/HomePage.css";

function formatTarih(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function HomePage() {
  const [kayitlar, setKayitlar] = useState([]);
  const [filtre, setFiltre] = useState("Hepsi");
  const [filtreTarihi, setFiltreTarihi] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000");

    ws.onopen = () => {
      console.log("WebSocket bağlantısı kuruldu.");
      ws.send(JSON.stringify({ type: "fetchRecords" }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Gelen mesaj:", message);

      if (message.type === "records") {
        setKayitlar(message.data);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket Hatası:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket bağlantısı kapatıldı.");
    };

    return () => {
      ws.close();
    };
  }, []);

  var idInList = 1;

  // Seçime göre filtrelenmiş kayıtları belirle
  const filtrelenmisKayitlar = kayitlar.filter((kayit) => {
    const durumUygun = filtre === "Hepsi" || kayit.Durumu === filtre;

    // Tarih kontrolü
    const tarihUygun =
      !filtreTarihi || formatTarih(kayit.TeslimAlmaTarihi) === filtreTarihi;

    return durumUygun && tarihUygun;
  });

  return (
    <>
      <h1>Enigma Technical Service (ETS) | Kayitlar</h1>
      <div className="row align-items-center mb-3">
        {/* Filtreleme Dropdown */}
        <div className="col-auto">
          <div className="dropdown">
            <button
              className="btn btn-success dropdown-toggle"
              type="button"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {filtre} {/* Seçilen filtreyi göster */}
            </button>
            <ul
              className="dropdown-menu dropdown-menu-dark"
              aria-labelledby="dropdownMenuButton"
            >
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => setFiltre("Hepsi")}
                >
                  Hepsi
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => setFiltre("Onarılıyor")}
                >
                  Onarılıyor
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => setFiltre("Bekliyor")}
                >
                  Bekliyor
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => setFiltre("Hazırlanıyor")}
                >
                  Hazırlanıyor
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => setFiltre("Tamamlandı")}
                >
                  Tamamlandı
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => setFiltre("İade Edildi")}
                >
                  İade Edildi
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => setFiltre("Teslim Edildi")}
                >
                  Teslim Edildi
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Tarih Filtreleme */}
        <div className="col-auto">
          <input
            type="date"
            id="filtreTarihi"
            className="form-control"
            value={filtreTarihi}
            onChange={(e) => setFiltreTarihi(e.target.value)}
          />
        </div>
      </div>

      <div className="table">
        <table border="1" cellPadding="5" cellSpacing="0" className="w-100">
          <thead>
            <tr>
              <th>Fis No</th>
              <th>Adı Soyadı</th>
              <th>Teslim Alma Tarihi</th>
              <th>Telefon 1</th>
              <th>Telefon 2</th>
              <th>Seri No</th>
              <th>Ürün</th>
              <th>Marka</th>
              <th>Model</th>
              <th>Durumu</th>
              <th>Garanti Durumu</th>
              <th>Alim Yeri</th>
              <th>Teslim Alan</th>
              <th>Ücret</th>
              <th>Şikayet</th>
              <th>Düzenle</th>
            </tr>
          </thead>
          <tbody>
            {filtrelenmisKayitlar.length > 0 ? (
              filtrelenmisKayitlar.map((kayit) => (
                <tr
                  key={kayit.FisNo}
                  className={
                    kayit.Durumu === "Onarılıyor"
                      ? "bg-warning"
                      : kayit.Durumu === "Tamamlandı"
                      ? "bg-success"
                      : kayit.Durumu === "Bekliyor"
                      ? "bg-secondary"
                      : kayit.Durumu === "İade Edildi"
                      ? "bg-danger"
                      : kayit.Durumu === "Teslim Edildi"
                      ? "bg-primary"
                      : ""
                  }
                >
                  <td>
                    ({idInList++}) <strong>{kayit.FisNo}#</strong>
                  </td>
                  <td>{kayit.AdiSoyadi}</td>
                  <td>
                    {kayit.TeslimAlmaTarihi && kayit.TeslimAlmaSaati
                      ? `${new Date(kayit.TeslimAlmaTarihi).toLocaleDateString(
                          "tr-TR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          }
                        )} | ${kayit.TeslimAlmaSaati.slice(0, 5)}`
                      : "Belirtilmedi"}
                  </td>
                  <td>{kayit.Telefon1}</td>
                  <td>{kayit.Telefon2}</td>
                  <td>{kayit.SeriNo}</td>
                  <td>{kayit.Urun}</td>
                  <td>{kayit.Marka}</td>
                  <td>{kayit.Model}</td>
                  <td>{kayit.Durumu}</td>
                  <td>{kayit.GarantiDurumu}</td>
                  <td>{kayit.AlimYeri}</td>
                  <td>{kayit.TeslimAlan}</td>
                  <td>{kayit.Ucret}</td>
                  <td>{kayit.Sorunlar}</td>
                  <td>
                    <button
                      style={{
                        backgroundColor: "grey",
                        borderRadius: "50px",
                        border: "1px solid black",
                        padding: "5px",
                      }}
                      onClick={() => navigate(`/edit/${kayit.FisNo}`)}
                    >
                      Düzenle
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="16" className="bg-danger text-white">
                  <strong>Kayıt bulunamadı.</strong>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
