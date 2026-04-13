export type ObsCode =
  | "WTEM"
  | "SLNTY"
  | "ATMP"
  | "ATMPR"
  | "HUMI"
  | "WNDRCT"
  | "WSPD"
  | "WSPD_GST"
  | "WVHGT"
  | "WVPD"
  | "CRDIR"
  | "CRSP"
  | "TDLV_OBS"
  | "TDLV_PRED";

export interface ObsSpec {
  obs_cd: ObsCode;
  unit: string;
}

export const KHOA_BUOY_FIELDS: Record<string, ObsSpec> = {
  wtem: { obs_cd: "WTEM", unit: "℃" },
  slnty: { obs_cd: "SLNTY", unit: "psu" },
  artmp: { obs_cd: "ATMP", unit: "℃" },
  atmpr: { obs_cd: "ATMPR", unit: "hPa" },
  wndrct: { obs_cd: "WNDRCT", unit: "deg" },
  wspd: { obs_cd: "WSPD", unit: "m/s" },
  maxMmntWspd: { obs_cd: "WSPD_GST", unit: "m/s" },
  wvhgt: { obs_cd: "WVHGT", unit: "m" },
  wvpd: { obs_cd: "WVPD", unit: "sec" },
  crdir: { obs_cd: "CRDIR", unit: "deg" },
  crsp: { obs_cd: "CRSP", unit: "cm/s" },
};

export const KHOA_TIDAL_FIELDS: Record<string, ObsSpec> = {
  bscTdlvHgt: { obs_cd: "TDLV_OBS", unit: "cm" },
  tdlvHgt: { obs_cd: "TDLV_PRED", unit: "cm" },
};

export const KMA_SEA_FIELDS: Record<string, ObsSpec> = {
  TW: { obs_cd: "WTEM", unit: "℃" },
  TA: { obs_cd: "ATMP", unit: "℃" },
  PA: { obs_cd: "ATMPR", unit: "hPa" },
  HM: { obs_cd: "HUMI", unit: "%" },
  WD: { obs_cd: "WNDRCT", unit: "deg" },
  WS: { obs_cd: "WSPD", unit: "m/s" },
  WS_GST: { obs_cd: "WSPD_GST", unit: "m/s" },
  WH: { obs_cd: "WVHGT", unit: "m" },
};
