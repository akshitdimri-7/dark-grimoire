import HeatMap from "@uiw/react-heat-map";
import { useState, useEffect } from "react";

// generete dummy activity

const generateActivityData = (startDate, endDate) => {
  const data = [];
  let currentDate = new Date(startDate);
  let end = new Date(endDate);

  while (currentDate <= end) {
    const count = Math.floor(Math.random() * 50);

    data.push({
      date: currentDate.toISOString().split("T")[0],
      count: count,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return data;
};

const getPanelColors = (maxCount) => {
  const colors = {};

  for (let i = 0; i <= maxCount; i++) {
    const greenValue = Math.floor((i / maxCount) * 255);
    colors[i] = `rgb(0,${greenValue},0)`;
  }

  return colors;
};

const HeatMapProfile = () => {
  const [activity, setActivity] = useState([]);
  const [panelColors, setPanelColors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const startDate = "2001-01-01";
      const endDate = "2001-01-31";
      const data = generateActivityData(startDate, endDate);
      setActivity(data);
      let maxCount = Math.max(...data.map((d) => d.count));
      setPanelColors(getPanelColors(maxCount));
    };
    fetchData();
  }, []);

  return (
    <div className="heatmap-section">
      <h4>Recent Contributions</h4>

      <HeatMap
        className="heatMapProfile"
        style={{ color: "white" }}
        value={activity}
        weekLabels={["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"]}
        startDate={new Date("2001-01-01")}
        rectSize={15}
        space={3}
        rectProps={{ rx: 2.5 }}
        panelColors={panelColors}
        legendCellSize={0}
      />
    </div>
  );
};

export default HeatMapProfile;
