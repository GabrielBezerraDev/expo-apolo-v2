const PALLET_STAGE_LABELS: Record<string, string> = {
  FINISHED: "Finalizado",
  PACKAGING: "Qualidade",
  PACKAGING_FOR_REVIEW: "Retorno Produção",
  PRODUCTION: "Produção",
  PRODUCTION_FOR_REVIEW: "Retorno Produção",
  STORAGE: "Expedição",
  TO_VALORLOG: "A caminho da Valorlog",
  VALORLOG_ENTRY: "ENTRADA VALORLOG",
  VALORLOG_EXIT: "SAÍDA VALORLOG",
  WIP: "WIP",
  WIP_FOR_REVIEW: "Retorno Apontamento",
};

export function getPalletStageLabel(value?: string | null) {
  return value ? PALLET_STAGE_LABELS[value] ?? value : "-";
}

export function getPalletStagePhotoTitle(value?: string | null) {
  const label = getPalletStageLabel(value);

  if (value === "WIP") return "Fotos da WIP";
  if (value === "STORAGE") return "Fotos da Expedição";
  if (value === "VALORLOG_ENTRY") return "Fotos da ENTRADA VALORLOG";
  if (value === "VALORLOG_EXIT") return "Fotos da SAÍDA VALORLOG";

  return `Fotos - ${label}`;
}
