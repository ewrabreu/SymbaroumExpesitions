import React, { useState, useEffect } from 'react';
import { Shield, Settings, Bot, AlertCircle, CheckCircle2, ExternalLink, LayoutDashboard, Library, BookOpen, Sword, User, Zap, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library'>('dashboard');
  const [botStatus, setBotStatus] = useState<'online' | 'offline' | 'error' | 'missing_credentials'>('offline');
  const [clientId, setClientId] = useState<string | null>(null);
  const [stats, setStats] = useState<{ characterCount: number; characters: any[]; commands: any[] }>({
    characterCount: 0,
    characters: [],
    commands: []
  });
  const [libraryData, setLibraryData] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        console.log('Fetching bot status...');
        const res = await fetch('/api/bot-status');
        if (!res.ok) {
          console.error(`Status fetch failed with HTTP ${res.status}`);
          return;
        }
        const data = await res.json();
        console.log('Bot status received:', data);
        setBotStatus(data.status);
        setClientId(data.clientId);
        if (data.status === 'online') {
          setStats({
            characterCount: data.characterCount,
            characters: data.characters,
            commands: data.commands
          });
        }
      } catch (err) {
        console.error('Failed to fetch bot status:', err);
      }
    };

    const fetchLibrary = async () => {
      try {
        console.log('Fetching library data...');
        const res = await fetch('/api/library');
        if (!res.ok) {
          console.error(`Library fetch failed with HTTP ${res.status}`);
          return;
        }
        const data = await res.json();
        console.log('Library data received');
        setLibraryData(data);
      } catch (err) {
        console.error('Failed to fetch library data:', err);
      }
    };

    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        console.log('API Health Check:', data);
      } catch (err) {
        console.error('API Health Check Failed:', err);
      }
    };

    checkHealth();
    fetchStatus();
    fetchLibrary();
    const interval = setInterval(fetchStatus, 10000); // Increased interval to reduce noise
    return () => clearInterval(interval);
  }, []);

  const inviteLink = clientId 
    ? `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=2147485696&scope=bot%20applications.commands`
    : '#';

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-sans flex flex-col items-center p-6">
      <div className="max-w-3xl w-full bg-stone-900 border border-stone-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 border-b border-stone-800 pb-6">
          <div className="w-16 h-16 bg-stone-800 rounded-2xl flex items-center justify-center border-2 border-amber-700 shadow-lg">
            <Bot className="text-amber-500" size={32} />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-serif text-amber-500">Symbaroum Bot</h1>
            <p className="text-stone-400">Assistente de Mesa Virtual para Discord</p>
          </div>
          <div className="flex-1" />
          <div className="flex bg-stone-950 p-1 rounded-lg border border-stone-800">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'dashboard' ? 'bg-amber-600 text-white shadow-lg' : 'text-stone-500 hover:text-stone-300'}`}
            >
              <LayoutDashboard size={18} />
              <span className="text-sm font-bold">Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'library' ? 'bg-amber-600 text-white shadow-lg' : 'text-stone-500 hover:text-stone-300'}`}
            >
              <Library size={18} />
              <span className="text-sm font-bold">Biblioteca</span>
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-bold text-stone-300 mb-4 flex items-center gap-2">
                <Settings size={20} className="text-stone-500" />
                Status do Bot
              </h2>
              
              <div className={`p-4 rounded-lg border flex items-center gap-3 ${
                botStatus === 'online' ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400' :
                botStatus === 'missing_credentials' ? 'bg-amber-950/30 border-amber-900/50 text-amber-400' :
                'bg-red-950/30 border-red-900/50 text-red-400'
              }`}>
                {botStatus === 'online' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                <div>
                  <p className="font-bold">
                    {botStatus === 'online' ? 'Bot Online e Operante' :
                     botStatus === 'missing_credentials' ? 'Credenciais Ausentes' :
                     'Erro de Conexão'}
                  </p>
                  <p className="text-sm opacity-80">
                    {botStatus === 'online' ? 'O bot está conectado ao Discord e pronto para receber comandos.' :
                     botStatus === 'missing_credentials' ? 'Configure as variáveis DISCORD_TOKEN e DISCORD_CLIENT_ID.' :
                     'O bot falhou ao conectar. Verifique se o token é válido.'}
                  </p>
                </div>
              </div>
            </section>

            {botStatus === 'missing_credentials' && (
              <div className="bg-stone-950 p-6 rounded-xl border border-stone-800">
                <h3 className="text-amber-500 font-bold mb-4">Como configurar seu bot:</h3>
                <ol className="list-decimal list-inside space-y-3 text-stone-400 text-sm">
                  <li>Acesse o <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">Discord Developer Portal</a>.</li>
                  <li>Crie uma nova aplicação e vá na aba <strong>Bot</strong>.</li>
                  <li>Copie o <strong>Token</strong> do bot.</li>
                  <li>Vá na aba <strong>OAuth2 &gt; General</strong> e copie o <strong>Client ID</strong>.</li>
                  <li>No menu de configurações do AI Studio (ícone de engrenagem), adicione as variáveis:
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-stone-500 font-mono">
                      <li>DISCORD_TOKEN="seu_token_aqui"</li>
                      <li>DISCORD_CLIENT_ID="seu_client_id_aqui"</li>
                    </ul>
                  </li>
                </ol>
              </div>
            )}

            {botStatus === 'online' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex flex-col items-center justify-center">
                    <span className="text-3xl font-serif text-amber-500">{stats.characterCount}</span>
                    <span className="text-xs text-stone-500 uppercase tracking-widest mt-1">Personagens Criados</span>
                  </div>
                  <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex flex-col items-center justify-center">
                    <span className="text-3xl font-serif text-amber-500">{stats.commands.length}</span>
                    <span className="text-xs text-stone-500 uppercase tracking-widest mt-1">Comandos Ativos</span>
                  </div>
                </div>

                {stats.characters.length > 0 && (
                  <div className="bg-stone-950 p-6 rounded-xl border border-stone-800">
                    <h3 className="text-stone-300 font-bold mb-4 flex items-center gap-2">
                      <Shield size={18} className="text-amber-600" />
                      Personagens Recentes
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {stats.characters.map((char, i) => (
                        <div key={i} className="bg-stone-900/50 p-3 rounded-lg border border-stone-800/50">
                          <p className="font-bold text-stone-200">{char.name}</p>
                          <p className="text-xs text-stone-500">{char.race || 'Sem Raça'} • {char.occupation || 'Sem Ocupação'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-stone-950 p-6 rounded-xl border border-stone-800">
                  <h3 className="text-stone-300 font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    Funcionalidades Implementadas
                  </h3>
                  <ul className="space-y-2 text-sm text-stone-400">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span><strong>Criação em 7 Passos:</strong> Sistema guiado com Arquétipos, Ocupações, Raças e Atributos.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span><strong>Combate Automatizado:</strong> Testes de ataque, defesa e iniciativa integrados com a ficha.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span><strong>Gestão de Corrupção:</strong> Controle de corrupção temporária/permanente e alertas de Estigmas.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span><strong>Base de Dados Completa:</strong> +30 habilidades, poderes místicos, rituais e equipamentos.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span><strong>Sombra e Estigmas:</strong> Registro da Sombra mística e descrição visual do personagem.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-stone-950 p-6 rounded-xl border border-stone-800">
                  <h3 className="text-stone-300 font-bold mb-4">Comandos Disponíveis</h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {stats.commands.map((cmd, i) => (
                      <div key={i} className="flex flex-col gap-1 border-b border-stone-900 pb-3 last:border-0">
                        <code className="text-amber-400 bg-stone-900 px-2 py-1 rounded w-fit text-sm">{cmd.name}</code>
                        <p className="text-sm text-stone-500">{cmd.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <a 
                  href={inviteLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-4 px-6 rounded-xl transition-colors"
                >
                  <ExternalLink size={20} />
                  Adicionar Bot ao seu Servidor
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {!libraryData ? (
              <div className="flex flex-col items-center justify-center py-20 text-stone-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-4"></div>
                <p>Carregando biblioteca de Symbaroum...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Raças */}
                <div className="bg-stone-950 p-6 rounded-xl border border-stone-800">
                  <h3 className="text-amber-500 font-bold mb-4 flex items-center gap-2">
                    <User size={18} />
                    Raças Disponíveis
                  </h3>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {libraryData.races.map((race: any, i: number) => (
                      <div key={i} className="border-l-2 border-amber-900/50 pl-3">
                        <p className="font-bold text-stone-200 text-sm">{race.name}</p>
                        <p className="text-xs text-amber-600 italic mb-1">{race.traits.join(', ')}</p>
                        <p className="text-xs text-stone-500">{race.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Atributos */}
                <div className="bg-stone-950 p-6 rounded-xl border border-stone-800">
                  <h3 className="text-amber-500 font-bold mb-4 flex items-center gap-2">
                    <Zap size={18} />
                    Atributos Principais
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Acurácia', desc: 'Precisão em ataques e coordenação.' },
                      { name: 'Agilidade', desc: 'Velocidade, reflexos e esquiva.' },
                      { name: 'Astúcia', desc: 'Conhecimento, lógica e memória.' },
                      { name: 'Discrição', desc: 'Furtividade e silêncio.' },
                      { name: 'Eloquência', desc: 'Carisma e persuasão.' },
                      { name: 'Força', desc: 'Força física e saúde.' },
                      { name: 'Resolução', desc: 'Resistência mental e misticismo.' },
                      { name: 'Vigilância', desc: 'Percepção e iniciativa.' }
                    ].map((attr, i) => (
                      <div key={i} className="flex flex-col">
                        <span className="text-sm font-bold text-stone-300">{attr.name}</span>
                        <span className="text-xs text-stone-500">{attr.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Habilidades */}
                <div className="bg-stone-950 p-6 rounded-xl border border-stone-800">
                  <h3 className="text-amber-500 font-bold mb-4 flex items-center gap-2">
                    <BookOpen size={18} />
                    Habilidades & Poderes
                  </h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {libraryData.abilities.map((ability: any, i: number) => (
                      <div key={i} className="bg-stone-900/30 p-2 rounded border border-stone-800/50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-stone-200">{ability.name}</span>
                          <span className="text-[10px] bg-stone-800 px-1.5 py-0.5 rounded text-stone-400 uppercase">{ability.category}</span>
                        </div>
                        <p className="text-xs text-stone-500 line-clamp-2">{ability.description_novice}</p>
                      </div>
                    ))}
                    <p className="text-[10px] text-stone-600 italic text-center">Use /habilidade ver [nome] para detalhes completos</p>
                  </div>
                </div>

                {/* Equipamentos */}
                <div className="bg-stone-950 p-6 rounded-xl border border-stone-800">
                  <h3 className="text-amber-500 font-bold mb-4 flex items-center gap-2">
                    <Sword size={18} />
                    Arsenal Comum
                  </h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {libraryData.equipment.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center border-b border-stone-900 pb-2 last:border-0">
                        <div>
                          <p className="text-sm font-bold text-stone-300">{item.name}</p>
                          <p className="text-[10px] text-amber-700">{item.qualities.join(', ') || 'Sem qualidades'}</p>
                        </div>
                        <span className="text-xs font-mono bg-stone-900 px-2 py-1 rounded text-amber-500">{item.damage || item.protection || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arquétipos */}
                <div className="bg-stone-950 p-6 rounded-xl border border-stone-800 md:col-span-2">
                  <h3 className="text-amber-500 font-bold mb-4 flex items-center gap-2">
                    <Info size={18} />
                    Arquétipos & Ocupações
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {libraryData.archetypes.map((arch: any, i: number) => (
                      <div key={i} className="bg-stone-900/40 p-4 rounded border border-stone-800">
                        <p className="font-bold text-amber-600 mb-1">{arch.name}</p>
                        <p className="text-[10px] text-stone-500 mb-3 uppercase tracking-wider">Atributos: {arch.keyAttributes.join(', ')}</p>
                        <div className="space-y-2">
                          {arch.occupations.map((occ: any, j: number) => (
                            <div key={j} className="text-xs">
                              <span className="text-stone-300 font-medium">• {occ.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-amber-950/20 border border-amber-900/30 p-4 rounded-xl flex gap-3">
              <Info className="text-amber-500 shrink-0" size={20} />
              <p className="text-xs text-stone-400 leading-relaxed">
                Esta biblioteca contém apenas um resumo dos dados integrados ao bot. No Discord, você pode usar os comandos de consulta (como <code className="text-amber-600">/traco ver</code> ou <code className="text-amber-600">/poder ver</code>) para acessar as descrições completas de todos os níveis e regras especiais do livro básico de Symbaroum.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
