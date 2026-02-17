import React, { useState, useEffect } from 'react';
import { Field, Input } from '@zendeskgarden/react-forms';
import { Button } from '@zendeskgarden/react-buttons';
import { SERVICOS_MEDICO_FIELD_ID } from '../constants';
import {
  CondicionalSection,
  ServicosHeader,
  ServicoItem,
  ServicoHeader,
  ServicoTitle,
  ContadorServicos
} from '../styles/ServicosStyles';

const VAZIO = () => ({ servico: '', prestador: '' });

const TipoMedico = ({ ticketId, showToast }) => {
  const [servicos, setServicos] = useState([VAZIO()]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => { loadServicos(); }, []);

  const loadServicos = async () => {
    try {
      const fieldPath = `ticket.customField:custom_field_${SERVICOS_MEDICO_FIELD_ID}`;
      const data      = await window.zafClient.get(fieldPath);
      const raw       = data[fieldPath] || '[]';
      try {
        const parsed = JSON.parse(raw);
        setServicos(Array.isArray(parsed) && parsed.length > 0 ? parsed : [VAZIO()]);
      } catch {
        setServicos([VAZIO()]);
      }
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    }
  };

  const adicionar = () => setServicos([...servicos, VAZIO()]);

  const remover = (i) => {
    if (servicos.length === 1) {
      showToast('Deve existir pelo menos um serviço', 'warning');
      return;
    }
    setServicos(servicos.filter((_, idx) => idx !== i));
  };

  const atualizar = (i, campo, valor) => {
    const novo = [...servicos];
    novo[i][campo] = valor;
    setServicos(novo);
  };

  const salvar = async () => {
    if (!ticketId) { showToast('Salve/crie o ticket primeiro', 'warning'); return; }
    setLoading(true);
    try {
      const validos    = servicos.filter(s => s.servico.trim() || s.prestador.trim());
      const jsonString = JSON.stringify(validos);
      const fieldPath  = `ticket.customField:custom_field_${SERVICOS_MEDICO_FIELD_ID}`;

      await window.zafClient.set(fieldPath, jsonString);

      await window.zafClient.request({
        url:         `/api/v2/tickets/${ticketId}.json`,
        type:        'PUT',
        contentType: 'application/json',
        data:        JSON.stringify({
          ticket: {
            custom_fields: [{ id: parseInt(SERVICOS_MEDICO_FIELD_ID), value: jsonString }]
          }
        })
      });

      showToast('Salvo com sucesso', 'success');
    } catch (err) {
      console.error('Erro ao salvar serviços:', err);
      showToast(`Erro ao salvar: ${JSON.stringify(err)}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CondicionalSection>
      <ServicosHeader>
        <h3 style={{ margin: 0, fontSize: '14px' }}>Serviços Médicos</h3>
        <Button size="small" onClick={adicionar}>+ Adicionar serviço</Button>
      </ServicosHeader>

      {servicos.map((s, i) => (
        <ServicoItem key={i}>
          <ServicoHeader>
            <ServicoTitle>Serviço {i + 1}</ServicoTitle>
            {servicos.length > 1 && (
              <Button size="small" isDanger onClick={() => remover(i)}>Remover</Button>
            )}
          </ServicoHeader>
          <Field>
            <Field.Label>Serviço</Field.Label>
            <Input
              value={s.servico}
              onChange={(e) => atualizar(i, 'servico', e.target.value)}
              placeholder="Nome do serviço..."
            />
          </Field>
          <Field>
            <Field.Label>Prestador</Field.Label>
            <Input
              value={s.prestador}
              onChange={(e) => atualizar(i, 'prestador', e.target.value)}
              placeholder="Nome do prestador..."
            />
          </Field>
        </ServicoItem>
      ))}

      <ContadorServicos>Total de serviços: {servicos.length}</ContadorServicos>

      <Button isPrimary isStretched onClick={salvar} disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar Serviços'}
      </Button>
    </CondicionalSection>
  );
};

export default TipoMedico;
