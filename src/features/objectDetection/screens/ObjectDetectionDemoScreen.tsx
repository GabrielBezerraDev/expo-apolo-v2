import React, { useCallback, useEffect, useState } from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  type Frame,
  useCameraDevice,
  useCameraPermission,
  useFrameOutput,
} from 'react-native-vision-camera';
import { scheduleOnRN } from 'react-native-worklets';
import {
  CocoLabel,
  type Detection,
  useObjectDetection,
} from 'react-native-executorch';

type CocoDetection = Detection<typeof CocoLabel>;

const translatedLabels: Partial<Record<keyof typeof CocoLabel, string>> = {
  PERSON: 'Pessoa',
  CAR: 'Carro',
  TRUCK: 'Caminhão',
  BIRD: 'Pássaro',
  CAT: 'Gato',
  DOG: 'Cachorro',
  BACKPACK: 'Mochila',
  BOTTLE: 'Garrafa',
  CUP: 'Copo',
  CHAIR: 'Cadeira',
  TV: 'Televisão',
  LAPTOP: 'Notebook',
  CELL_PHONE: 'Celular',
  BOOK: 'Livro',
};

const objectDetectionModel = {
  modelName: 'ssdlite-320-mobilenet-v3-large',
  modelSource: require('../../../assets/models/ssdlite320_mobilenet_v3_large_xnnpack_fp32.pte'),
} as const;

function formatLabel(label: keyof typeof CocoLabel) {
  return (
    translatedLabels[label] ??
    String(label)
      .toLowerCase()
      .replaceAll('_', ' ')
      .replace(/^./, (character) => character.toUpperCase())
  );
}

export function ObjectDetectionDemoScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const device = useCameraDevice('back');
  const {
    hasPermission,
    canRequestPermission,
    requestPermission,
  } = useCameraPermission();
  const detector = useObjectDetection({
    model: objectDetectionModel,
  });
  const [detections, setDetections] = useState<CocoDetection[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasPermission && canRequestPermission) {
      void requestPermission();
    }
  }, [canRequestPermission, hasPermission, requestPermission]);

  const updateDetections = useCallback((results: CocoDetection[]) => {
    setDetections([...results].sort((a, b) => b.score - a.score).slice(0, 5));
  }, []);

  const runOnFrame = detector.runOnFrame;
  const frameOutput = useFrameOutput({
    targetResolution: { width: 1280, height: 720 },
    pixelFormat: 'rgb',
    dropFramesWhileBusy: true,
    enablePreviewSizedOutputBuffers: true,
    onFrame: useCallback(
      (frame: Frame) => {
        'worklet';
        try {
          if (!runOnFrame) return;

          const results = runOnFrame(frame, false, {
            detectionThreshold: 0.5,
          });
          scheduleOnRN(updateDetections, results);
        } finally {
          frame.dispose();
        }
      },
      [runOnFrame, updateDetections]
    ),
  });

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Permissão de câmera necessária</Text>
        <Text style={styles.emptyMessage}>
          A câmera é usada apenas para executar a detecção local no aparelho.
        </Text>
        <Pressable
          accessibilityRole="button"
          style={styles.actionButton}
          onPress={() => {
            if (canRequestPermission) {
              void requestPermission();
            } else {
              void Linking.openSettings();
            }
          }}
        >
          <Text style={styles.actionButtonText}>
            {canRequestPermission ? 'Permitir câmera' : 'Abrir configurações'}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Câmera traseira indisponível</Text>
      </View>
    );
  }

  const error = detector.error ? String(detector.error) : cameraError;
  const primaryDetection = detections[0];

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused}
        outputs={detector.isReady ? [frameOutput] : []}
        orientationSource="device"
        resizeMode="cover"
        onError={(event) => setCameraError(event.message)}
      />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.eyebrow}>EXECUTORCH · DEMO LOCAL</Text>
        <Text style={styles.title}>Detecção de objetos</Text>
        <Text style={styles.subtitle}>
          Aponte para um copo, garrafa, pessoa ou outro objeto comum.
        </Text>
      </View>

      {!detector.isReady && !error && (
        <View style={styles.loadingCard}>
          <Text style={styles.loadingTitle}>Preparando o modelo</Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(detector.downloadProgress * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.loadingText}>
            {Math.round(detector.downloadProgress * 100)}% · Modelo incluído no aplicativo
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Não foi possível iniciar a detecção</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={[styles.resultsCard, { marginBottom: insets.bottom + 12 }]}>
        {primaryDetection ? (
          <>
            <Text style={styles.resultCaption}>OBJETO PRINCIPAL</Text>
            <View style={styles.primaryResultRow}>
              <Text style={styles.primaryLabel}>
                {formatLabel(primaryDetection.label)}
              </Text>
              <Text style={styles.primaryScore}>
                {Math.round(primaryDetection.score * 100)}%
              </Text>
            </View>
            {detections.slice(1).length > 0 && (
              <Text style={styles.secondaryResults}>
                Também detectado: {detections
                  .slice(1)
                  .map((detection) => formatLabel(detection.label))
                  .join(', ')}
              </Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.resultCaption}>ANALISANDO EM TEMPO REAL</Text>
            <Text style={styles.waitingLabel}>
              {detector.isReady ? 'Procurando objetos…' : 'Aguardando o modelo…'}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090909',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 28,
    backgroundColor: '#17120f',
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyMessage: {
    color: '#c9c2bd',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  actionButton: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#ff6200',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.66)',
  },
  eyebrow: {
    color: '#ff9b5c',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: {
    marginTop: 5,
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: '#ded8d4',
    fontSize: 13,
    lineHeight: 18,
  },
  loadingCard: {
    position: 'absolute',
    top: '42%',
    left: 24,
    right: 24,
    padding: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(20, 17, 15, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 155, 92, 0.42)',
  },
  loadingTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    marginTop: 14,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: '#44352c',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#ff6200',
  },
  loadingText: {
    marginTop: 9,
    color: '#c9c2bd',
    fontSize: 12,
  },
  errorCard: {
    position: 'absolute',
    top: '38%',
    left: 24,
    right: 24,
    padding: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(70, 14, 14, 0.94)',
    borderWidth: 1,
    borderColor: '#ef6b6b',
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  errorText: {
    marginTop: 7,
    color: '#ffd4d4',
    fontSize: 12,
    lineHeight: 17,
  },
  resultsCard: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 0,
    minHeight: 108,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(14, 12, 11, 0.90)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  resultCaption: {
    color: '#ff9b5c',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  primaryResultRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryLabel: {
    flex: 1,
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
  },
  primaryScore: {
    color: '#ffb181',
    fontSize: 18,
    fontWeight: '900',
  },
  secondaryResults: {
    marginTop: 4,
    color: '#c9c2bd',
    fontSize: 12,
  },
  waitingLabel: {
    marginTop: 7,
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
});
