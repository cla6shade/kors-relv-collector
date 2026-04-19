export type ObsCode =
  | "wtem"
  | "slnty"
  | "atmp"
  | "atmpr"
  | "humi"
  | "wndrct"
  | "wspd"
  | "wspd_gst"
  | "wvhgt"
  | "wvpd"
  | "crdir"
  | "crsp"
  | "tdlv_obs"
  | "tdlv_pred";

export interface ObsSpec {
  obs_cd: ObsCode;
  unit: string;
}

export const KHOA_BUOY_FIELDS: Record<string, ObsSpec> = {
  wtem: { obs_cd: "wtem", unit: "℃" },
  slnty: { obs_cd: "slnty", unit: "psu" },
  artmp: { obs_cd: "atmp", unit: "℃" },
  atmpr: { obs_cd: "atmpr", unit: "hPa" },
  wndrct: { obs_cd: "wndrct", unit: "deg" },
  wspd: { obs_cd: "wspd", unit: "m/s" },
  maxMmntWspd: { obs_cd: "wspd_gst", unit: "m/s" },
  wvhgt: { obs_cd: "wvhgt", unit: "m" },
  wvpd: { obs_cd: "wvpd", unit: "sec" },
  crdir: { obs_cd: "crdir", unit: "deg" },
  crsp: { obs_cd: "crsp", unit: "cm/s" },
};

export const KHOA_TIDAL_FIELDS: Record<string, ObsSpec> = {
  bscTdlvHgt: { obs_cd: "tdlv_obs", unit: "cm" },
  tdlvHgt: { obs_cd: "tdlv_pred", unit: "cm" },
};

export const KMA_SEA_FIELDS: Record<string, ObsSpec> = {
  TW: { obs_cd: "wtem", unit: "℃" },
  TA: { obs_cd: "atmp", unit: "℃" },
  PA: { obs_cd: "atmpr", unit: "hPa" },
  HM: { obs_cd: "humi", unit: "%" },
  WD: { obs_cd: "wndrct", unit: "deg" },
  WS: { obs_cd: "wspd", unit: "m/s" },
  WS_GST: { obs_cd: "wspd_gst", unit: "m/s" },
  WH: { obs_cd: "wvhgt", unit: "m" },
};
