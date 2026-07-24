import { Asset } from "expo-asset";

const manualAssetModule = require("@assets/manual/manual.pdf");

export async function getLocalManualUri() {
  const asset = Asset.fromModule(manualAssetModule);
  await asset.downloadAsync();

  if (!asset.localUri) {
    throw new Error("O arquivo local do manual não está disponível.");
  }

  return asset.localUri;
}
