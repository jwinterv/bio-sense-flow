import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { AppLayout } from '@/layouts/AppLayout';

export const Route = createFileRoute('/relatorios')({
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const [hasteId, setHasteId] = useState('1');
  const [dataInicio, setDataInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('00:00');
  const [dataFim, setDataFim] = useState('');
  const [horaFim, setHoraFim] = useState('23:59');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Solicitando relatório...');

    try {
      const url = `http://localhost:5000/hastes/${hasteId}/relatorio-email?data_inicio=${dataInicio}&data_fim=${dataFim}&hora_inicio=${horaInicio}&hora_fim=${horaFim}&email=${encodeURIComponent(email)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(data.mensagem);
      } else {
        setStatus(`Erro (${response.status}): Não foi possível processar o relatório.`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setStatus('Erro de conexão com a API. Verifique se o Uvicorn está rodando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Relatórios" subtitle="Exportação de dados por e-mail">
      <div className="max-w-2xl mx-auto p-6 bg-card border border-border rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-2 font-display text-foreground">
          📊 Exportar Relatório em PDF
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Selecione a haste e o período desejado para receber o relatório completo na sua caixa de entrada.
        </p>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              ID da Haste
            </label>
            <input
              type="number"
              value={hasteId}
              onChange={(e) => setHasteId(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Data de Início
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Hora de Início
              </label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Data de Fim
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Hora de Fim
              </label>
              <input
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              E-mail de Destino
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu-email@exemplo.com"
              className="w-full px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 px-4 rounded-md font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Processando e Enviando...' : 'Enviar Relatório por E-mail'}
          </button>
        </form>

        {status && (
          <p className="mt-4 p-3 rounded-md text-sm border bg-muted/20 border-border text-foreground">
            {status}
          </p>
        )}
      </div>
    </AppLayout>
  );
}