export type OperationItem = {
  id: string;
  type: 'entry' | 'exit';
  doneAt: string;
  completedSteps: string;
  status: string;
  client: string;
  totalPallets: number;
};

export type PalletItem = {
  id: string;
  dateTime: string;
  stage: 'WIP' | 'EXPEDIÇÃO' | 'FINALIZADO';
  variant: string;
  quantity: number;
  batch: string;
  line: string;
};

export const entryOperations: OperationItem[] = [
  { id: 'e1', type: 'entry', doneAt: '19/05/2026 7:41', completedSteps: '4/4 etapas concluídas', status: 'Conferido', client: 'Valorlog CD Norte', totalPallets: 18 },
  { id: 'e2', type: 'entry', doneAt: '19/05/2026 8:23', completedSteps: '3/4 etapas concluídas', status: 'Aguardando revisão', client: 'Apolo Bebidas', totalPallets: 12 },
  { id: 'e3', type: 'entry', doneAt: '19/05/2026 9:02', completedSteps: '4/4 etapas concluídas', status: 'Finalizado', client: 'Valorlog CD Sul', totalPallets: 22 },
];

export const exitOperations: OperationItem[] = [
  { id: 's1', type: 'exit', doneAt: '19/05/2026 13:46', completedSteps: '4/4 etapas concluídas', status: 'Expedido', client: 'Cliente Industrial A', totalPallets: 15 },
  { id: 's2', type: 'exit', doneAt: '19/05/2026 14:12', completedSteps: '2/4 etapas concluídas', status: 'Em carregamento', client: 'Cliente Industrial B', totalPallets: 9 },
  { id: 's3', type: 'exit', doneAt: '19/05/2026 15:28', completedSteps: '4/4 etapas concluídas', status: 'Finalizado', client: 'Operação Valorlog', totalPallets: 31 },
];

export const palletItems: PalletItem[] = [
  { id: 'p1', dateTime: '19/05/2026 07:41', stage: 'WIP', variant: 'SKU 600ML RETORNÁVEL', quantity: 84, batch: 'A555273', line: 'Linha 03' },
  { id: 'p2', dateTime: '19/05/2026 09:18', stage: 'EXPEDIÇÃO', variant: 'SKU 1L PET', quantity: 60, batch: 'T555273', line: 'Linha 01' },
  { id: 'p3', dateTime: '19/05/2026 11:30', stage: 'FINALIZADO', variant: 'SKU 350ML LATA', quantity: 120, batch: 'A123456', line: 'Linha 05' },
];
