import React, { useState, useEffect } from 'react';
import { Field, Select } from '@zendeskgarden/react-forms';
import TipoInformativo from './TipoInformativo';
import TipoTecnico     from './TipoTecnico';
import TipoMedico      from './TipoMedico';
import { TIPO_SINISTRO_FIELD_ID, TIPO_OPTIONS } from '../constants';
import { ServicosContainer, TipoSinistroSection } from '../styles/ServicosStyles';

const ServicosTab = ({ ticketId, showToast }) => {
  const [tipoSinistro, setTipoSinistro] = useState('');
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    if (ticketId) loadTipoSinistro();
    else          setLoading(false);
  }, [ticketId]);

  const loadTipoSinistro = async () => {
    try {
      const fieldPath = `ticket.customField:custom_field_${TIPO_SINISTRO_FIELD_ID}`;
      const data      = await window.zafClient.get(fieldPath);
      setTipoSinistro(data[fieldPath] || '');
    } catch (err) {
      console.error('Erro ao carregar tipo de sinistro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTipoChange = async (e) => {
    const newValue = e.target.value;
    setTipoSinistro(newValue);
    if (!ticketId) { showToast('Salve/crie o ticket primeiro', 'warning'); return; }
    try {
      await window.zafClient.set(
        `ticket.customField:custom_field_${TIPO_SINISTRO_FIELD_ID}`,
        newValue
      );
    } catch (err) {
      console.error('Erro ao atualizar tipo:', err);
    }
  };

  const renderCondicional = () => {
    if (!tipoSinistro)
      return <p style={{ color: '#68737d', fontSize: '13px' }}>Selecione um tipo de sinistro acima.</p>;
    switch (tipoSinistro) {
      case 'sinistro_informativo': return <TipoInformativo ticketId={ticketId} showToast={showToast} />;
      case 'sinistro_tecnico':     return <TipoTecnico     ticketId={ticketId} showToast={showToast} />;
      case 'sinistro_medico':      return <TipoMedico      ticketId={ticketId} showToast={showToast} />;
      default: return <p>Tipo não reconhecido.</p>;
    }
  };

  if (loading) return <ServicosContainer>Carregando...</ServicosContainer>;

  return (
    <ServicosContainer>
      <TipoSinistroSection>
        <Field>
          <Field.Label>Tipo do Sinistro</Field.Label>
          <Select value={tipoSinistro} onChange={handleTipoChange}>
            <option value="">Selecione...</option>
            {TIPO_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.name}</option>
            ))}
          </Select>
        </Field>
      </TipoSinistroSection>
      {renderCondicional()}
    </ServicosContainer>
  );
};

export default ServicosTab;
