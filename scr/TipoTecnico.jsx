import React, { useState, useEffect } from 'react';
import { Field, Input } from '@zendeskgarden/react-forms';
import { Button } from '@zendeskgarden/react-buttons';
import { COBERTURA_FIELD_ID } from '../constants';
import { CondicionalSection } from '../styles/ServicosStyles';

const TipoTecnico = ({ ticketId, showToast }) => {
  const [cobertura, setCobertura] = useState('');
  const [loading, setLoading]     = useState(false);

  useEffect(() => { loadCobertura(); }, []);

  const loadCobertura = async () => {
    try {
      const fieldPath = `ticket.customField:custom_field_${COBERTURA_FIELD_ID}`;
      const data      = await window.zafClient.get(fieldPath);
      setCobertura(data[fieldPath] || '');
    } catch (err) {
      console.error('Erro ao carregar cobertura:', err);
    }
  };

  const salvar = async () => {
    if (!ticketId) { showToast('Salve/crie o ticket primeiro', 'warning'); return; }
    setLoading(true);
    try {
      await window.zafClient.set(
        `ticket.customField:custom_field_${COBERTURA_FIELD_ID}`,
        cobertura
      );
      await window.zafClient.request({
        url:         `/api/v2/tickets/${ticketId}.json`,
        type:        'PUT',
        contentType: 'application/json',
        data:        JSON.stringify({
          ticket: {
            custom_fields: [{ id: parseInt(COBERTURA_FIELD_ID), value: cobertura }]
          }
        })
      });
      showToast('Salvo com sucesso', 'success');
    } catch (err) {
      console.error('Erro ao salvar cobertura:', err);
      showToast(`Erro ao salvar: ${JSON.stringify(err)}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CondicionalSection>
      <Field>
        <Field.Label>Cobertura</Field.Label>
        <Input
          value={cobertura}
          onChange={(e) => setCobertura(e.target.value)}
          placeholder="Digite a cobertura..."
        />
      </Field>
      <Button isPrimary onClick={salvar} disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </Button>
    </CondicionalSection>
  );
};

export default TipoTecnico;
