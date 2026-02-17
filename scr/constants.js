// ⚠️ SUBSTITUA OS 2 IDs ABAIXO PELOS IDs REAIS DOS SEUS CAMPOS NO ZENDESK
export const REGISTRO_FIELD_ID        = 'SEU_ID_AQUI'; // campo "Registro do Caso" (multi-line text)
export const SERVICOS_MEDICO_FIELD_ID = 'SEU_ID_AQUI'; // campo "Serviços Médico" (multi-line text)

// Campos existentes — não mexer
export const TIPO_SINISTRO_FIELD_ID = '32121339187603';
export const TRATATIVA_FIELD_ID     = '49176310817427';
export const COBERTURA_FIELD_ID     = '48391739916563';

export const TIPO_OPTIONS = [
  { value: 'sinistro_tecnico',     name: 'Técnico' },
  { value: 'sinistro_informativo', name: 'Informativo' },
  { value: 'sinistro_medico',      name: 'Médico' }
];
