import React, { useState, useEffect } from 'react';
import { Field, Select } from '@zendeskgarden/react-forms';
import { Button } from '@zendeskgarden/react-buttons';
import { TRATATIVA_FIELD_ID } from '../constants';
import { CondicionalSection } from '../styles/ServicosStyles';

const TipoInformativo = ({ ticketId, showToast }) => {
  const [tratativa, setTratativa]               = useState('');
  const [tratativaOptions, setTratativaOptions] = useState([]);
  const [loading, setLoading]                   = useState(false);

  useEffect(() => { loadTratativa(); }, []);

  const loadTratativa = async () => {
    try {
      const fieldPath = `ticket.customField:custom_field_${TRATATIVA_FIELD_ID}`;
      const data      = await window.zafClient.get(fieldPath);
      setTratativa(data[fieldPath] || '');

      const resp = await window.zafClient.request({
        url:  `/api/v2/ticket_fields/${TRATATIVA_FIELD_ID}.json`,
        type: 'GET'
      });
      if (resp?.ticket_field?.custom_field_options) {
        setTratativaOptions(resp.ticket_field.custom_field_options);
      }
    } catch (err) {
      console.error('Erro ao carregar tratativa:', err);
    }
  };

  const salvar = async () => {
    if (!ticketId) { showToast('Salve/crie o ticket primeiro', 'warning'); return; }
    if (!tratativa) { showToast('Selecione uma tratativa', 'warning'); return; }
    setLoading(true);
    try {
      await window.zafClient.set(
        `ticket.customField:custom_field_${TRATATIVA_FIELD_ID}`,
        tratativa
      );
      await window.zafClient.request({
        url:         `/api/v2/tickets/${ticketId}.json`,
        type:        'PUT',
        contentType: 'application/json',
        data:        JSON.stringify({
          ticket: {
            custom_fields: [{ id: parseInt(TRATATIVA_FIELD_ID), value: tratativa }]
          }
        })
      });
      showToast('Salvo com sucesso', 'success');
    } catch (err) {
      console.error('Erro ao salvar tratativa:', err);
      showToast(`Erro ao salvar: ${JSON.stringify(err)}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CondicionalSection>
      <Field>
        <Field.Label>Tratativa</Field.Label>
        <Select value={tratativa} onChange={(e) => setTratativa(e.target.value)}>
          <option value="">Selecione...</option>
          {tratativaOptions.map(o => (
            <option key={o.value} value={o.value}>{o.name}</option>
          ))}
        </Select>
      </Field>
      <Button isPrimary onClick={salvar} disabled={loading || !tratativa}>
        {loading ? 'Salvando...' : 'Salvar'}
      </Button>
    </CondicionalSection>
  );
};

export default TipoInformativo;
