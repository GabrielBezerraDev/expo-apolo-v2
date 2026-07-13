import React, { useState } from "react";
import { AppButton } from "@shared/components/Forms/AppButton";
import { downloadAndInstallApk } from "../../services/appUpdateService";
import {
  Description,
  ErrorText,
  ProgressBarFill,
  ProgressBarWrapper,
  ProgressText,
  Title,
  UpdateRoot,
  VersionText,
} from "./styled";

type ForceUpdateModalProps = {
  currentVersion: string;
  downloadUrl: string;
  latestVersion: string;
};

type UpdateStatus = "idle" | "downloading" | "installing" | "error";

export function ForceUpdateModal({ currentVersion, downloadUrl, latestVersion }: ForceUpdateModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const isBusy = status === "downloading" || status === "installing";

  const installUpdate = async () => {
    if (isBusy) return;

    setErrorMessage(null);
    setProgress(0);
    setStatus("downloading");

    try {
      await downloadAndInstallApk({
        downloadUrl,
        latestVersion,
        onInstallStart: () => setStatus("installing"),
        onProgress: setProgress,
      });
      setStatus("error");
      setErrorMessage("Instalador fechado. Se a atualização não foi concluída, tente novamente.");
    } catch {
      setStatus("error");
      setErrorMessage("Falha ao baixar ou instalar. Verifique a conexão e tente novamente.");
    }
  };

  return (
    <UpdateRoot>
      <Title>Atualização obrigatória</Title>
      <VersionText>Nova versão: {latestVersion}</VersionText>
      <Description>
        Sua versão atual é {currentVersion}. Para continuar usando o Valorlog, instale a nova versão.
      </Description>

      {status !== "idle" ? (
        <>
          <ProgressBarWrapper>
            <ProgressBarFill width={`${progress}%`} />
          </ProgressBarWrapper>
          <ProgressText>{getProgressText(status, progress)}</ProgressText>
        </>
      ) : null}

      <AppButton
        disabled={isBusy}
        loading={isBusy}
        title={status === "error" ? "TENTAR NOVAMENTE" : "INSTALAR NOVA VERSÃO"}
        onPress={installUpdate}
        style={{ width: "100%" }}
      />

      {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}
    </UpdateRoot>
  );
}

function getProgressText(status: UpdateStatus, progress: number) {
  if (status === "downloading") return `Baixando... ${progress}%`;
  if (status === "installing") return "Abrindo instalador nativo...";
  if (status === "error") return "Erro ao baixar a atualização";

  return "";
}
