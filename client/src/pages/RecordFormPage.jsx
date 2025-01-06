import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditPage() {
  const { fisNo } = useParams();
  const navigate = useNavigate();
  const [kayit, setKayit] = useState(null);
  const [hata, setHata] = useState("");

  useEffect(() => {
    if (!fisNo) {
      setHata("Fiş numarası bulunamadı.");
      return;
    }

    fetch(`http://localhost:5000/api/record/${fisNo}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP hata kodu: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setKayit(data))
      .catch((error) => {
        setHata(`Veri çekme hatası: ${error.message}`);
        console.error("Veri çekme hatası:", error);
      });
  }, [fisNo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setKayit((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSave = () => {
    if (!kayit) {
      alert("Güncellenmek için geçerli veri bulunamadı.");
      return;
    }

    fetch(`http://localhost:5000/api/record/${fisNo}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(kayit),
    })
      .then((response) => {
        if (response.ok) {
          alert("Kayıt başarıyla güncellendi!");
          navigate("/index");
        } else {
          alert("Güncelleme sırasında bir hata oluştu.");
        }
      })
      .catch((error) => {
        alert(`Güncelleme hatası: ${error.message}`);
        console.error("Güncelleme hatası:", error);
      });
  };

  if (hata) {
    return <div>Hata: {hata}</div>;
  }

  if (!kayit) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div>
      <h1>Fiş Düzenleme: {fisNo}</h1>
      <form>
        {Object.entries(kayit).map(([key, value]) => (
          <div key={key} style={{ marginBottom: "10px" }}>
            {!(key === "TeslimAlmaTarihi" || key === "TeslimAlmaSaati") && (
              <label style={{ marginRight: "10px" }}>
                <div>{key}:</div>
              </label>
            )}
            {!(key === "TeslimAlmaTarihi" || key === "TeslimAlmaSaati") ? (
              value ? (
                <input
                  type="text"
                  name={key}
                  value={value}
                  readOnly
                  style={{
                    backgroundColor: "#f0f0f0",
                    padding: "5px",
                    width: "300px",
                    border: "1px solid #ccc",
                  }}
                />
              ) : (
                <input
                  type="text"
                  name={key}
                  value={value || ""}
                  onChange={handleInputChange}
                  style={{ padding: "5px", width: "300px" }}
                />
              )
            ) : (
              ""
            )}
          </div>
        ))}
      </form>
      <button
        onClick={handleSave}
        style={{
          backgroundColor: "blue",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Kaydet
      </button>
    </div>
  );
}
