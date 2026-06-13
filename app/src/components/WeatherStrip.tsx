import { Ic, P } from "./icons";

export interface WeatherDay {
  /** weekday initial(s), already localized */
  label: string;
  icon: "sun" | "cloud";
  /** rain, mm */
  rain: string;
  /** ET₀, mm */
  et0: string;
}

/** 7-day weather strip (Field Report): 7 columns, highlight irrigation day. */
export function WeatherStrip({
  days,
  highlight,
}: {
  days: WeatherDay[];
  highlight?: number;
}) {
  const icons = { sun: P.sun, cloud: P.cloud };
  return (
    <div className="strip7">
      {days.map((d, i) => (
        <div key={i} className={"day" + (i === highlight ? " hl" : "")}>
          <span className="dw">{d.label}</span>
          <Ic
            d={icons[d.icon]}
            size={17}
            color={d.icon === "sun" ? "#c08a12" : "var(--ink-3)"}
            sw={1.6}
          />
          <span className="v">{d.rain}</span>
          <span className="v2">{d.et0}</span>
        </div>
      ))}
    </div>
  );
}
