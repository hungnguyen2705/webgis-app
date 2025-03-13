import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const WebGIS = () => {
  const [geoData, setGeoData] = useState(null);
  const [stormData, setStormData] = useState([]);
  const [year, setYear] = useState("2024");
  const [stormType, setStormType] = useState("all");

  useEffect(() => {
    fetch("/vietnam_admin.geojson")
      .then((response) => response.json())
      .then((data) => setGeoData(data))
      .catch((error) => console.error("Lỗi tải GeoJSON:", error));
  }, []);

  useEffect(() => {
    const fetchStormData = async () => {
      try {
        const response = await fetch(`https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=stormevents&startdate=${year}-01-01&enddate=${year}-12-31&limit=10`, {
          headers: {
            Authorization: `Bearer djvymDtTbMCGvMtUdqcScpGfzldQqZhB`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Dữ liệu bão:", data);
        setStormData(data.results || []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu bão:", error);
        console.error("Chi tiết lỗi:", error.message);
      }
    };

    fetchStormData();
  }, [year]);

  const stormIcon = new L.Icon({
    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Hurricane-symbol.png",
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });

  const filterStorms = stormData.filter((storm) => {
    if (stormType === "all") return true;
    return storm.intensity === stormType;
  });

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000, background: "white", padding: "10px", borderRadius: "5px" }}>
        <label>
          Chọn Năm: 
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {[...Array(10)].map((_, i) => (
              <option key={i} value={2024 - i}>{2024 - i}</option>
            ))}
          </select>
        </label>
        <label>
          Loại bão: 
          <select value={stormType} onChange={(e) => setStormType(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="Tropical Depression">Áp thấp nhiệt đới</option>
            <option value="Tropical Storm">Bão</option>
            <option value="Hurricane">Siêu bão</option>
          </select>
        </label>
      </div>
      <MapContainer center={[16.0471, 108.2062]} zoom={6} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {geoData && <GeoJSON data={geoData} style={{ color: "blue", weight: 1, fillOpacity: 0.2 }} />}
        {filterStorms.map((storm, index) => (
          <Marker key={index} position={[storm.latitude, storm.longitude]} icon={stormIcon}>
            <Popup>
              <b>Bão:</b> {storm.name || "Không có thông tin"} <br />
              <b>Ngày:</b> {storm.date || "Không xác định"} <br />
              <b>Cường độ:</b> {storm.intensity || "Không có dữ liệu"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default WebGIS;
