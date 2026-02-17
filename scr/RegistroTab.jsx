import React, { useState, useEffect } from 'react';
import { Field, Textarea } from '@zendeskgarden/react-forms';
import { Button } from '@zendeskgarden/react-buttons';
import { REGISTRO_FIELD_ID } from '../constants';
import {
  RegistroContainer,
  RegistroForm,
  RegistroLista,
  RegistroItem,
  RegistroMeta,
  RegistroTexto
} from '../styles/RegistroStyles';

const RegistroTab = ({ ticketId, currentUser, showToast }) => {
  const [registroTexto, setRegistroTexto] = useState('');
  const [registros, setRegistros]         = useState([]);
  const [loading, setLoading]             = useState(false);

  useEffect(() => {
    if (ticketId) loadRegistros();
  }, [ticketId]);

  const loadRegistros = async () => {
    try {
      const fieldPath = `ticket.customField:custom_field_${REGISTRO_FIELD_ID}`;
      const data      = await window.zafClient.get(fieldPath);
      const raw       = data[fieldPath] || '[]';
      try {
        const parsed = JSON.parse(raw);
        setRegistros(Array.isArray(parsed) ? parsed : []);
      } catch {
        setRegistros([]);
      }
    } catch (err) {
      console.error('Erro ao carregar registros:', err);
    }
  };

  const adicionarRegistro = async () => {
    if (!ticketId) {
      showToast('Salve/crie o ticket primeiro', 'warning');
      return;
    }
    if (!registroTexto.trim()) {
      showToast('Digite um texto para o registro', 'warning');
      return;
    }

    setLoading(true);
    try {
      const novoRegistro = {
        ts:      new Date().toISOString(),
        autor:   currentUser?.name || 'Agente',
        autorId: currentUser?.id   || 0,
        texto:   registroTexto.trim()
      };

      const novosRegistros = [novoRegistro, ...registros];
      const jsonString     = JSON.stringify(novosRegistros);
      const fieldPath      = `ticket.customField:custom_field_${REGISTRO_FIELD_ID}`;

      await window.zafClient.set(fieldPath, jsonString);

      await window.zafClient.request({
        url:         `/api/v2/tickets/${ticketId}.json`,
        type:        'PUT',
        contentType: 'application/json',
        data:        JSON.stringify({
          ticket: {
            custom_fields: [{ id: parseInt(REGISTRO_FIELD_ID), value: jsonString }]
          }
        })
      });

      setRegistros(novosRegistros);
      setRegistroTexto('');
      showToast('Registro adicionado com sucesso', 'success');
    } catch (err) {
      console.error('Erro ao adicionar registro:', err);
      showToast(`Erro ao salvar: ${JSON.stringify(err)}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (iso) =>
    new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

  return (
    <RegistroContainer>
      <RegistroForm>
        <Field>
          <Textarea
            value={registroTexto}
            onChange={(e) => setRegistroTexto(e.target.value)}
            placeholder="Digite o registro do caso..."
            rows={5}
            disabled={loading}
          />
        </Field>
        <Button
          isPrimary
          onClick={adicionarRegistro}
          disabled={loading || !registroTexto.trim()}
        >
          {loading ? 'Salvando...' : 'Adicionar registro'}
        </Button>
      </RegistroForm>

      <RegistroLista>
        {registros.length === 0 ? (
          <p style={{ color: '#68737d', fontSize: '13px' }}>
            Nenhum registro ainda. Adicione o primeiro registro acima.
          </p>
        ) : (
          registros.map((r, i) => (
            <RegistroItem key={i}>
              <RegistroMeta>
                <strong>{r.autor}</strong>
                <span>{formatarData(r.ts)}</span>
              </RegistroMeta>
              <RegistroTexto>{r.texto}</RegistroTexto>
            </RegistroItem>
          ))
        )}
      </RegistroLista>
    </RegistroContainer>
  );
};

export default RegistroTab;
