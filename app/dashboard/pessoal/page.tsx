'use client';

import Header from '@/components/ui/header';
import { SidebarDemo } from '@/components/ui/sidebar-demo';
import { useState, useEffect } from 'react';
import { Search, Filter, FileText, Shield, Car, Flame, Users, Edit, X, Phone, Mail, MapPin, Calendar, DollarSign, Plus, Upload, Trash2, UserPlus, Eye, Zap, Wrench, Heart, Star, Award } from 'lucide-react';
import { TbSteeringWheel, TbAxe, TbShield, TbClipboard, TbFireExtinguisher } from 'react-icons/tb';
import { supabase, uploadDocumento, getDocumentosBombeiro, deleteDocumento, getDocumentoUrl, DocumentoUpload } from '@/lib/supabase';

// Tipos para os dados
interface Bombeiro {
  id: string; // UUID do Supabase
  nome: string;
  funcao: 'BA-GS' | 'BA-CE' | 'BA-LR' | 'BA-MC' | 'BA-2';
  matricula: string;
  status: 'Ativo' | 'Férias' | 'Afastado' | 'Licença';
  telefone: string;
  email: string;
  endereco: string;
  dataAdmissao: string;
  documentos: number;
  ferista: boolean;
  equipe: 'Alfa' | 'Bravo' | 'Charlie' | 'Delta';
}

// Interface para arquivos com nomes personalizados
interface FileWithCustomName extends File {
  customName?: string;
  uploadTime?: number;
}

// Dados mockados
const bombeirosMock: Bombeiro[] = [
  {
    id: '1',
    nome: 'João Silva Santos',
    funcao: 'BA-GS',
    matricula: '1234',
    status: 'Ativo',
    telefone: '(11) 99999-9999',
    email: 'joao.silva@bombeiros.gov.br',
    endereco: 'Rua das Flores, 123 - Centro',
    dataAdmissao: '15/03/2020',
    documentos: 12,
    ferista: false,
    equipe: 'Alfa'
  },
  {
    id: '2',
    nome: 'Maria Oliveira Costa',
    funcao: 'BA-CE',
    matricula: '5678',
    status: 'Férias',
    telefone: '(11) 88888-8888',
    email: 'maria.oliveira@bombeiros.gov.br',
    endereco: 'Av. Principal, 456 - Jardim',
    dataAdmissao: '22/08/2019',
    documentos: 8,
    ferista: true,
    equipe: 'Bravo'
  },
  {
    id: '3',
    nome: 'Carlos Roberto Lima',
    funcao: 'BA-LR',
    matricula: '9012',
    status: 'Ativo',
    telefone: '(11) 77777-7777',
    email: 'carlos.lima@bombeiros.gov.br',
    endereco: 'Rua da Paz, 789 - Vila Nova',
    dataAdmissao: '10/01/2021',
    documentos: 15,
    ferista: false,
    equipe: 'Charlie'
  },
  {
    id: '4',
    nome: 'Ana Paula Ferreira',
    funcao: 'BA-MC',
    matricula: '3456',
    status: 'Afastado',
    telefone: '(11) 66666-6666',
    email: 'ana.ferreira@bombeiros.gov.br',
    endereco: 'Rua do Sol, 321 - Centro',
    dataAdmissao: '05/11/2018',
    documentos: 10,
    ferista: true,
    equipe: 'Delta'
  },
  {
    id: '5',
    nome: 'Pedro Henrique Souza',
    funcao: 'BA-2',
    matricula: '7890',
    status: 'Licença',
    telefone: '(11) 55555-5555',
    email: 'pedro.souza@bombeiros.gov.br',
    endereco: 'Av. das Nações, 654 - Bairro Alto',
    dataAdmissao: '18/06/2022',
    documentos: 6,
    ferista: false,
    equipe: 'Alfa'
  }
];

export default function PessoalPage() {
  // Estados do componente
  const [bombeiros, setBombeiros] = useState<Bombeiro[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFunction, setSelectedFunction] = useState<string>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedBombeiro, setSelectedBombeiro] = useState<Bombeiro | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isDocListModalOpen, setIsDocListModalOpen] = useState(false);
  const [selectedBombeiroForDocs, setSelectedBombeiroForDocs] = useState<Bombeiro | null>(null);
  const [pendingFiles, setPendingFiles] = useState<FileWithCustomName[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: DocumentoUpload[]}>({});
  const [fileNames, setFileNames] = useState<{[key: string]: string}>({});
  const [isUploading, setIsUploading] = useState(false);
  
  // Estados para edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBombeiro, setEditBombeiro] = useState<Partial<Bombeiro>>({});
  const [isConfirmEquipeModalOpen, setIsConfirmEquipeModalOpen] = useState(false);
  const [newEquipe, setNewEquipe] = useState<'Alfa' | 'Bravo' | 'Charlie' | 'Delta'>('Alfa');
  
  // Estados para exclusão de bombeiro
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [bombeiroToDelete, setBombeiroToDelete] = useState<Bombeiro | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estado para notificação
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });
  
  const [newBombeiro, setNewBombeiro] = useState<Partial<Bombeiro>>({
    nome: '',
    funcao: 'BA-GS',
    matricula: '',
    status: 'Ativo',
    telefone: '',
    email: '',
    endereco: '',
    dataAdmissao: '',
    documentos: 0,
    ferista: false,
    equipe: 'Alfa'
  });

  // Estado para dados do usuário
  const [userData, setUserData] = useState({
    userName: 'Carregando...',
    userEmail: 'carregando@...'
  });

  // Carregar dados do usuário autenticado
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Usar dados básicos do auth para evitar recursão RLS
          setUserData({
            userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
            userEmail: user.email || 'email@exemplo.com'
          });
          
          // Tentar buscar dados do perfil como fallback (sem bloquear a UI)
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', user.id)
              .single();

            if (profile && profile.full_name) {
              setUserData({
                userName: profile.full_name,
                userEmail: profile.email || user.email || 'email@exemplo.com'
              });
            }
          } catch (profileError) {
            // Ignorar erro de perfil e manter dados do auth
            console.log('Perfil não encontrado, usando dados do auth');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setUserData({
          userName: 'Usuário',
          userEmail: 'usuario@empresa.com'
        });
      }
    };

    loadUserData();
  }, []);

  // Carregar bombeiros do Supabase na inicialização
  useEffect(() => {
    const loadBombeiros = async () => {
      try {
        const { data, error } = await supabase
          .from('bombeiros')
          .select('*')
          .order('nome');

        if (error) {
          console.error('Erro ao carregar bombeiros:', error);
          return;
        }

        // Converter dados do Supabase para o formato local
        const bombeirosList: Bombeiro[] = data.map(item => ({
          id: item.id,
          nome: item.nome,
          funcao: item.funcao as 'BA-GS' | 'BA-CE' | 'BA-LR' | 'BA-MC' | 'BA-2',
          matricula: item.matricula,
          status: item.status as 'Ativo' | 'Férias' | 'Afastado' | 'Licença',
          telefone: item.telefone,
          email: item.email,
          endereco: item.endereco,
          dataAdmissao: new Date(item.data_admissao).toLocaleDateString('pt-BR'),
          documentos: 0, // Inicializar com 0 para evitar números fictícios
          ferista: item.ferista,
          equipe: item.equipe as 'Alfa' | 'Bravo' | 'Charlie' | 'Delta' || 'Alfa'
        }));

        // Não definir bombeiros ainda - aguardar contagem real
        // setBombeiros(bombeirosList);
        
        // Carregar documentos para cada bombeiro e definir estado apenas uma vez
        await loadAllDocuments(bombeirosList);
      } catch (error) {
        console.error('Erro inesperado ao carregar bombeiros:', error);
      }
    };

    loadBombeiros();
  }, []);

  // Carregar documentos de todos os bombeiros
  const loadAllDocuments = async (bombeirosList: Bombeiro[]) => {
    const documentsMap: {[key: string]: DocumentoUpload[]} = {};
    const updatedBombeiros: Bombeiro[] = [];
    
    for (const bombeiro of bombeirosList) {
      const { data: documentos } = await getDocumentosBombeiro(Number(bombeiro.id));
      if (documentos) {
        documentsMap[bombeiro.id] = documentos;
        // Atualizar contador de documentos com o valor real
        updatedBombeiros.push({
          ...bombeiro,
          documentos: documentos.length
        });
      } else {
        // Se não há documentos, manter o bombeiro com contador 0
        updatedBombeiros.push({
          ...bombeiro,
          documentos: 0
        });
      }
    }
    
    setUploadedFiles(documentsMap);
    // Atualizar os bombeiros com a contagem real de documentos
    setBombeiros(updatedBombeiros);
  };

  // Carregar documentos de um bombeiro específico
  const loadBombeiroDocuments = async (bombeiroId: string) => {
    const { data: documentos, error } = await getDocumentosBombeiro(Number(bombeiroId));
    if (error) {
      console.error('Erro ao carregar documentos:', error);
      showNotification('Erro ao carregar documentos', 'error');
      return;
    }
    
    if (documentos) {
      setUploadedFiles(prev => ({
        ...prev,
        [bombeiroId]: documentos
      }));
      
      // Atualizar contador de documentos do bombeiro
      setBombeiros(prev => prev.map(b => 
        b.id === bombeiroId 
          ? { ...b, documentos: documentos.length }
          : b
      ));
    }
  };

  // Função para obter ícone da função
  const getFuncaoIcon = (funcao: string) => {
    switch (funcao) {
      case 'BA-GS': return <TbClipboard className="w-5 h-5 text-black" />;
      case 'BA-CE': return <TbShield className="w-5 h-5 text-black" />;
      case 'BA-LR': return <TbAxe className="w-5 h-5 text-black" />;
      case 'BA-MC': return <TbSteeringWheel className="w-5 h-5 text-black" />;
      case 'BA-2': return <TbFireExtinguisher className="w-5 h-5 text-black" />;
      default: return <Award className="w-5 h-5 text-gray-600" />;
    }
  };

  // Função para obter cor da equipe - Cores sólidas sem bordas
  const getEquipeColor = (equipe: string) => {
    switch (equipe) {
      case 'Alfa': return 'bg-blue-100 text-blue-900';
      case 'Bravo': return 'bg-red-100 text-red-900';
      case 'Charlie': return 'bg-orange-100 text-orange-900';
      case 'Delta': return 'bg-purple-100 text-purple-900';
      default: return 'bg-gray-100 text-gray-900';
    }
  };

  // Função para obter cor do status - Cores sólidas sem bordas
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-200 text-green-900';
      case 'Férias': return 'bg-sky-200 text-sky-900';
      case 'Afastado': return 'bg-yellow-200 text-yellow-900';
      case 'Licença': return 'bg-pink-200 text-pink-900';
      default: return 'bg-slate-200 text-slate-900';
    }
  };

  // Filtrar bombeiros
  const filteredBombeiros = bombeiros.filter(bombeiro => {
    const matchesSearch = bombeiro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bombeiro.matricula.includes(searchTerm);
    const matchesStatus = selectedStatus === 'Todos' || bombeiro.status === selectedStatus;
    const matchesFuncao = selectedFunction === 'Todas' || bombeiro.funcao === selectedFunction;
    
    return matchesSearch && matchesStatus && matchesFuncao;
  });

  // Abrir modal com detalhes
  const openModal = (bombeiro: Bombeiro) => {
    setSelectedBombeiro(bombeiro);
    setIsModalOpen(true);
  };

  // Fechar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBombeiro(null);
  };

  // Abrir modal de adicionar
  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  // Fechar modal de adicionar
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewBombeiro({
      nome: '',
      funcao: 'BA-GS',
      matricula: '',
      status: 'Ativo',
      telefone: '',
      email: '',
      endereco: '',
      dataAdmissao: '',
      documentos: 0,
      ferista: false,
      equipe: 'Alfa'
    });
  };

  // Adicionar novo bombeiro
  const addBombeiro = async () => {
    console.log('Função addBombeiro chamada!');
    console.log('Dados do novo bombeiro:', newBombeiro);
    
    if (!newBombeiro.nome || !newBombeiro.matricula || !newBombeiro.telefone || !newBombeiro.email) {
      console.log('Campos obrigatórios não preenchidos');
      showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }

    console.log('Validação passou, tentando inserir no Supabase...');

    try {
      // Preparar dados para o Supabase
      const bombeiroData = {
        nome: newBombeiro.nome,
        funcao: newBombeiro.funcao || 'BA-GS',
        matricula: newBombeiro.matricula,
        status: newBombeiro.status || 'Ativo',
        telefone: newBombeiro.telefone,
        email: newBombeiro.email,
        endereco: newBombeiro.endereco || '',
        data_admissao: newBombeiro.dataAdmissao || new Date().toISOString().split('T')[0],
        documentos: newBombeiro.documentos || 0,
        ferista: newBombeiro.ferista || false,
        equipe: newBombeiro.equipe || 'Alfa'
      };

      console.log('Dados preparados para o Supabase:', bombeiroData);

      // Inserir no Supabase
      const { data, error } = await supabase
        .from('bombeiros')
        .insert([bombeiroData])
        .select()
        .single();

      console.log('Resposta do Supabase - data:', data);
      console.log('Resposta do Supabase - error:', error);

      if (error) {
        console.error('Erro ao inserir bombeiro:', error);
        showNotification('Erro ao adicionar bombeiro: ' + error.message, 'error');
        return;
      }

      // Converter data do Supabase para o formato local
      const bombeiroToAdd: Bombeiro = {
        id: data.id,
        nome: data.nome,
        funcao: data.funcao as 'BA-GS' | 'BA-CE' | 'BA-LR' | 'BA-MC' | 'BA-2',
        matricula: data.matricula,
        status: data.status as 'Ativo' | 'Férias' | 'Afastado' | 'Licença',
        telefone: data.telefone,
        email: data.email,
        endereco: data.endereco,
        dataAdmissao: new Date(data.data_admissao).toLocaleDateString('pt-BR'),
        documentos: data.documentos,
        ferista: data.ferista,
        equipe: data.equipe as 'Alfa' | 'Bravo' | 'Charlie' | 'Delta' || 'Alfa'
      };

      console.log('Bombeiro convertido para adicionar:', bombeiroToAdd);

      // Atualizar estado local
      setBombeiros([...bombeiros, bombeiroToAdd]);
      closeAddModal();
      showNotification(`Bombeiro ${data.nome} adicionado com sucesso!`, 'success');

    } catch (error) {
      console.error('Erro inesperado:', error);
      showNotification('Erro inesperado ao adicionar bombeiro.', 'error');
    }
  };

  // Função para mostrar notificação
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({
      show: true,
      message,
      type
    });

    // Auto-hide após 4 segundos
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Atualizar campo do novo bombeiro
  const updateNewBombeiroField = (field: keyof Bombeiro, value: any) => {
    setNewBombeiro(prev => ({ ...prev, [field]: value }));
  };

  // Funções para modal de edição
  const openEditModal = (bombeiro: Bombeiro) => {
    setEditBombeiro({ ...bombeiro });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditBombeiro({});
  };

  // Atualizar campo do bombeiro em edição
  const updateEditBombeiroField = (field: keyof Bombeiro, value: any) => {
    setEditBombeiro(prev => ({ ...prev, [field]: value }));
  };

  // Função para salvar edições
  const saveEditBombeiro = async () => {
    if (!editBombeiro.id) return;

    try {
      // Preparar dados para o Supabase
      const bombeiroData = {
        nome: editBombeiro.nome,
        funcao: editBombeiro.funcao,
        matricula: editBombeiro.matricula,
        status: editBombeiro.status,
        telefone: editBombeiro.telefone,
        email: editBombeiro.email,
        endereco: editBombeiro.endereco,
        data_admissao: editBombeiro.dataAdmissao ? new Date(editBombeiro.dataAdmissao.split('/').reverse().join('-')).toISOString().split('T')[0] : undefined,
        ferista: editBombeiro.ferista,
        equipe: editBombeiro.equipe
      };

      // Atualizar no Supabase
      const { error } = await supabase
        .from('bombeiros')
        .update(bombeiroData)
        .eq('id', editBombeiro.id);

      if (error) {
        console.error('Erro ao atualizar bombeiro:', error);
        showNotification('Erro ao atualizar bombeiro: ' + error.message, 'error');
        return;
      }

      // Atualizar estado local
      setBombeiros(prev => prev.map(b => 
        b.id === editBombeiro.id ? { ...editBombeiro as Bombeiro } : b
      ));

      // Atualizar bombeiro selecionado se for o mesmo
      if (selectedBombeiro?.id === editBombeiro.id) {
        setSelectedBombeiro(editBombeiro as Bombeiro);
      }

      closeEditModal();
      showNotification(`Bombeiro ${editBombeiro.nome} atualizado com sucesso!`, 'success');

    } catch (error) {
      console.error('Erro inesperado:', error);
      showNotification('Erro inesperado ao atualizar bombeiro.', 'error');
    }
  };

  // Função para abrir modal de confirmação de mudança de equipe
  const openConfirmEquipeModal = (novaEquipe: 'Alfa' | 'Bravo' | 'Charlie' | 'Delta') => {
    setNewEquipe(novaEquipe);
    setIsConfirmEquipeModalOpen(true);
  };

  // Função para confirmar mudança de equipe
  const confirmEquipeChange = async () => {
    if (!editBombeiro.id) return;

    try {
      // Atualizar no Supabase
      const { error } = await supabase
        .from('bombeiros')
        .update({ equipe: newEquipe })
        .eq('id', editBombeiro.id);

      if (error) {
        console.error('Erro ao atualizar equipe:', error);
        showNotification('Erro ao atualizar equipe: ' + error.message, 'error');
        return;
      }

      // Atualizar estado local
      setBombeiros(prev => prev.map(b => 
        b.id === editBombeiro.id ? { ...b, equipe: newEquipe } : b
      ));

      // Atualizar bombeiro em edição
      setEditBombeiro(prev => ({ ...prev, equipe: newEquipe }));

      // Atualizar bombeiro selecionado se for o mesmo
      if (selectedBombeiro?.id === editBombeiro.id) {
        setSelectedBombeiro(prev => prev ? { ...prev, equipe: newEquipe } : null);
      }

      setIsConfirmEquipeModalOpen(false);
      showNotification(`Equipe alterada para ${newEquipe} com sucesso!`, 'success');

    } catch (error) {
      console.error('Erro inesperado:', error);
      showNotification('Erro inesperado ao atualizar equipe.', 'error');
    }
  };

  // Função para abrir modal de exclusão
  const openDeleteModal = (bombeiro: Bombeiro) => {
    setBombeiroToDelete(bombeiro);
    setDeleteConfirmationText('');
    setIsDeleteModalOpen(true);
  };

  // Função para fechar modal de exclusão
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setBombeiroToDelete(null);
    setDeleteConfirmationText('');
    setIsDeleting(false);
  };

  // Função para excluir bombeiro
  const deleteBombeiro = async () => {
    if (!bombeiroToDelete || isDeleting) return;

    // Verificar se o texto de confirmação está correto
    const expectedText = `EXCLUIR ${bombeiroToDelete.nome.toUpperCase()}`;
    if (deleteConfirmationText !== expectedText) {
      showNotification('Texto de confirmação incorreto. Digite exatamente: ' + expectedText, 'error');
      return;
    }

    setIsDeleting(true);

    try {
      // IMPORTANTE: As ocorrências em que o bombeiro participou são preservadas
      // pois elas armazenam apenas o nome do bombeiro no campo 'bombeiros_envolvidos'
      // como um array de texto, não como referência por ID.
      
      // 1. Primeiro, excluir todos os documentos do bombeiro
      const { error: docsError } = await supabase
        .from('documentos')
        .delete()
        .eq('bombeiro_id', bombeiroToDelete.id);

      if (docsError) {
        console.error('Erro ao excluir documentos:', docsError);
        showNotification('Erro ao excluir documentos do bombeiro: ' + docsError.message, 'error');
        setIsDeleting(false);
        return;
      }

      // 2. Depois, excluir o bombeiro
      // As ocorrências permanecem intactas com o nome do bombeiro preservado
      const { error: bombeiroError } = await supabase
        .from('bombeiros')
        .delete()
        .eq('id', bombeiroToDelete.id);

      if (bombeiroError) {
        console.error('Erro ao excluir bombeiro:', bombeiroError);
        showNotification('Erro ao excluir bombeiro: ' + bombeiroError.message, 'error');
        setIsDeleting(false);
        return;
      }

      // 3. Atualizar estado local
      setBombeiros(prev => prev.filter(b => b.id !== bombeiroToDelete.id));
      
      // 4. Limpar documentos do estado local
      setUploadedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[bombeiroToDelete.id];
        return newFiles;
      });

      // 5. Fechar modal se o bombeiro excluído estava sendo visualizado
      if (selectedBombeiro?.id === bombeiroToDelete.id) {
        setSelectedBombeiro(null);
        setIsModalOpen(false);
      }

      // 6. Fechar modal de edição se o bombeiro excluído estava sendo editado
      if (editBombeiro.id === bombeiroToDelete.id) {
        closeEditModal();
      }

      closeDeleteModal();
      showNotification(`Bombeiro ${bombeiroToDelete.nome} foi excluído. Suas ocorrências foram preservadas no histórico.`, 'success');

    } catch (error) {
      console.error('Erro inesperado ao excluir bombeiro:', error);
      showNotification('Erro inesperado ao excluir bombeiro.', 'error');
      setIsDeleting(false);
    }
  };

  // Abrir modal de documentos
  const openDocModal = (bombeiro: Bombeiro) => {
    setSelectedBombeiroForDocs(bombeiro);
    setIsDocModalOpen(true);
    // Carregar documentos atualizados quando abrir o modal
    loadBombeiroDocuments(bombeiro.id);
  };

  // Fechar modal de documentos
  const closeDocModal = () => {
    setIsDocModalOpen(false);
    setSelectedBombeiroForDocs(null);
    setPendingFiles([]);
    setFileNames({});
  };

  // Função para fechar modal de listagem
  const closeDocListModal = () => {
    setIsDocListModalOpen(false);
    setSelectedBombeiroForDocs(null);
  };

  // Função para remover arquivo pendente
  const removePendingFile = (fileIndex: number) => {
    setPendingFiles(prev => {
      const updatedFiles = prev.filter((_, index) => index !== fileIndex);
      // Recriar índices dos nomes dos arquivos
      const newFileNames: {[key: string]: string} = {};
      updatedFiles.forEach((file, index) => {
        newFileNames[index.toString()] = file.customName || file.name;
      });
      setFileNames(newFileNames);
      return updatedFiles;
    });
  };

  // Abrir modal de documentos do bombeiro selecionado
  const openDocumentsModal = (bombeiro: Bombeiro) => {
    setSelectedBombeiroForDocs(bombeiro);
    setIsDocListModalOpen(true);
    // Carregar documentos atualizados
    loadBombeiroDocuments(bombeiro.id);
  };

  // Função para upload de arquivos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).map((file, index) => {
        const fileWithCustomName = file as FileWithCustomName;
        fileWithCustomName.customName = file.name;
        return fileWithCustomName;
      });
      
      setPendingFiles(prev => {
        const updatedFiles = [...prev, ...newFiles];
        // Inicializar nomes personalizados
        const newFileNames: {[key: string]: string} = {};
        updatedFiles.forEach((file, index) => {
          newFileNames[index.toString()] = file.customName || file.name;
        });
        setFileNames(newFileNames);
        return updatedFiles;
      });
    }
  };

  // Função para atualizar nome personalizado do arquivo
  const updateFileName = (fileIndex: number, newName: string) => {
    setFileNames(prev => ({
      ...prev,
      [fileIndex.toString()]: newName
    }));
    
    setPendingFiles(prev => prev.map((file, index) => {
      if (index === fileIndex) {
        const updatedFile = file as FileWithCustomName;
        updatedFile.customName = newName;
        return updatedFile;
      }
      return file;
    }));
  };

  // Nova função para enviar arquivos para o Supabase
  const sendFiles = async () => {
    if (pendingFiles.length === 0 || !selectedBombeiroForDocs) {
      showNotification('Nenhum arquivo selecionado', 'error');
      return;
    }

    setIsUploading(true);
    
    try {
      const uploadPromises = pendingFiles.map(async (file, index) => {
        const nomePersonalizado = fileNames[index.toString()] || file.customName || file.name;
        return await uploadDocumento(Number(selectedBombeiroForDocs.id), file, nomePersonalizado);
      });

      const results = await Promise.all(uploadPromises);
      
      // Verificar se houve erros
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Erros no upload:', errors.map(err => ({
          message: typeof err.error === 'object' && err.error !== null && 'message' in err.error ? (err.error.message || 'Erro desconhecido') : 'Erro desconhecido',
          details: err.error
        })));
        
        // Mostrar detalhes específicos dos erros
        const errorMessages = errors.map(err => 
          typeof err.error === 'object' && err.error !== null && 'message' in err.error 
            ? (err.error.message || 'Erro desconhecido') 
            : 'Erro desconhecido'
        ).join(', ');
        showNotification(`Erro ao enviar ${errors.length} arquivo(s): ${errorMessages}`, 'error');
      } else {
        showNotification(`${results.length} arquivo(s) enviado(s) com sucesso!`, 'success');
      }

      // Recarregar documentos do bombeiro
      await loadBombeiroDocuments(selectedBombeiroForDocs.id);
      
      // Limpar arquivos pendentes e fechar modal de upload
      setPendingFiles([]);
      setFileNames({});
      setIsDocModalOpen(false);
      
      // Abrir modal de listagem se houver sucesso
      if (errors.length === 0) {
        setIsDocListModalOpen(true);
      }
      
    } catch (error) {
      console.error('Erro inesperado no upload:', error);
      showNotification('Erro inesperado ao enviar arquivos', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Remover arquivo do Supabase
  const removeFile = async (documento: DocumentoUpload, fileIndex: number) => {
    if (!selectedBombeiroForDocs || !documento.id) return;

    try {
      const { error } = await deleteDocumento(documento.id, documento.caminho_storage);
      
      if (error) {
        console.error('Erro ao remover documento:', error);
        showNotification('Erro ao remover documento', 'error');
        return;
      }

      showNotification('Documento removido com sucesso', 'success');
      
      // Recarregar documentos do bombeiro
      await loadBombeiroDocuments(selectedBombeiroForDocs.id);
      
    } catch (error) {
      console.error('Erro inesperado ao remover documento:', error);
      showNotification('Erro inesperado ao remover documento', 'error');
    }
  };

  // Função para formatar tamanho do arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Função para visualizar documento
  const viewDocument = async (documento: DocumentoUpload) => {
    try {
      const url = await getDocumentoUrl(documento.caminho_storage);
      if (url) {
        if (url?.data?.signedUrl) {
          window.open(url.data.signedUrl, '_blank');
        }
      } else {
        showNotification('Erro ao gerar URL do documento', 'error');
      }
    } catch (error) {
      console.error('Erro ao visualizar documento:', error);
      showNotification('Erro ao visualizar documento', 'error');
    }
  };

  // Função para obter ícone do tipo de arquivo
  const getFileIcon = (fileName: string) => {
    if (!fileName) return <FileText className="w-5 h-5 text-gray-600" />;
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'xlsx':
      case 'xls':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <SidebarDemo>
      <div className="flex flex-col h-full">

        <Header userName={userData.userName} userEmail={userData.userEmail} />
        
        <div className="flex-1 bg-fog-gray/30 overflow-auto min-h-screen transition-colors duration-300">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            {/* Cabeçalho */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-coal-black mb-2 transition-colors duration-300">Gestão de Pessoal</h1>
              <p className="text-coal-black/70 transition-colors duration-300">Controle completo do efetivo da corporação</p>
            </div>
            
            {/* Botão Adicionar */}
            <div className="mb-6">
              <button
                onClick={openAddModal}
                className="bg-gradient-to-r from-radiant-orange to-radiant-orange/80 hover:from-radiant-orange/90 hover:to-radiant-orange/70 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Adicionar Colaborador
              </button>
            </div>
            
            {/* Filtros e Busca */}
            <div className="bg-pure-white rounded-lg shadow-sm border border-fog-gray/20 p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                {/* Campo de Busca */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coal-black/40 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou matrícula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-fog-gray/30 rounded-lg focus:ring-2 focus:ring-radiant-orange/20 focus:border-radiant-orange transition-colors"
                  />
                </div>
                
                {/* Filtro por Status */}
                <div className="flex items-center gap-2">
                  <Filter className="text-coal-black/60 w-5 h-5" />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-3 border border-fog-gray/30 rounded-lg focus:ring-2 focus:ring-radiant-orange/20 focus:border-radiant-orange transition-colors bg-white"
                  >
                    <option value="Todos">Todos os Status</option>
                    <option value="Ativo">Ativo</option>
                    <option value="Férias">Férias</option>
                    <option value="Afastado">Afastado</option>
                    <option value="Licença">Licença</option>
                  </select>
                </div>
                
                {/* Filtro por Função */}
                <div>
                  <select
                    value={selectedFunction}
                    onChange={(e) => setSelectedFunction(e.target.value)}
                    className="px-4 py-3 border border-fog-gray/30 rounded-lg focus:ring-2 focus:ring-radiant-orange/20 focus:border-radiant-orange transition-colors bg-white"
                  >
                    <option value="Todas">Todas as Funções</option>
                    <option value="BA-GS">BA-GS</option>
                    <option value="BA-CE">BA-CE</option>
                    <option value="BA-LR">BA-LR</option>
                    <option value="BA-MC">BA-MC</option>
                    <option value="BA-2">BA-2</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Lista do Efetivo */}
            <div className="bg-pure-white rounded-lg shadow-sm border border-fog-gray/20 overflow-hidden">
              <div className="px-6 py-4 border-b border-fog-gray/20">
                <h2 className="text-xl font-semibold text-coal-black">Efetivo da Seção</h2>
                <p className="text-sm text-coal-black/60 mt-1">{filteredBombeiros.length} bombeiros encontrados</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-fog-gray/20">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-coal-black uppercase tracking-wider">Nome</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-coal-black uppercase tracking-wider">Função</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-coal-black uppercase tracking-wider">Equipe</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-coal-black uppercase tracking-wider">Matrícula</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-coal-black uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-coal-black uppercase tracking-wider">Docs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-fog-gray/10">
                    {filteredBombeiros.map((bombeiro) => (
                      <tr 
                        key={bombeiro.id}
                        onClick={() => openModal(bombeiro)}
                        className={`hover:bg-fog-gray/5 cursor-pointer transition-all duration-200 group ${bombeiro.ferista ? 'bg-orange-50/30' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-coal-black text-sm group-hover:text-radiant-orange transition-colors">
                              {bombeiro.nome}
                            </div>
                            {bombeiro.ferista && (
                              <div className="relative">
                                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse shadow-sm" title="Ferista"></div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0">
                              {getFuncaoIcon(bombeiro.funcao)}
                            </div>
                            <span className="font-medium text-coal-black text-sm">{bombeiro.funcao}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium border ${getEquipeColor(bombeiro.equipe)}`}>
                            {bombeiro.equipe}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-coal-black/80 text-sm">{bombeiro.matricula}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(bombeiro.status)}`}>
                            {bombeiro.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openDocModal(bombeiro);
                            }}
                            className="flex items-center gap-1 text-coal-black/60 hover:text-radiant-orange transition-colors group/btn"
                          >
                            <FileText className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            <span className="text-sm font-medium">{bombeiro.documentos}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal de Detalhes */}
        {isModalOpen && selectedBombeiro && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-pure-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden">
              {/* Header do Modal */}
              <div className="relative bg-gradient-to-r from-radiant-orange to-radiant-orange/80 text-white p-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                      {getFuncaoIcon(selectedBombeiro.funcao)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1 text-pure-white">{selectedBombeiro.nome}</h3>
                      <div className="flex items-center gap-3 text-pure-white">
                        <span className="text-sm font-medium text-pure-white">{selectedBombeiro.funcao}</span>
                        <span className="w-1 h-1 bg-pure-white rounded-full"></span>
                        <span className="text-sm text-pure-white">Mat. {selectedBombeiro.matricula}</span>
                        {selectedBombeiro.ferista && (
                          <div className="bg-yellow-400 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold ml-2 shadow-lg">
                            F
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Status e Equipe Badges */}
                <div className="mt-6 flex items-center gap-3">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedBombeiro.status)}`}>
                    {selectedBombeiro.status}
                  </span>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getEquipeColor(selectedBombeiro.equipe)}`}>
                    Equipe {selectedBombeiro.equipe}
                  </span>
                </div>
              </div>
              
              {/* Conteúdo do Modal */}
              <div className="overflow-y-auto max-h-[calc(95vh-280px)]">
                <div className="p-8 space-y-8">
                  {/* Dados Pessoais */}
                  <div className="bg-fog-gray/30 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 bg-radiant-orange/10 rounded-lg flex items-center justify-center">
                        <Phone className="w-4 h-4 text-radiant-orange" />
                      </div>
                      <h4 className="text-xl font-bold text-coal-black">Dados Pessoais</h4>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-pure-white rounded-lg p-4 border border-fog-gray/20 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <Phone className="w-5 h-5 text-radiant-orange" />
                          <span className="text-sm font-medium text-coal-black/60 uppercase tracking-wide">Telefone</span>
                        </div>
                        <p className="text-lg font-semibold text-coal-black">{selectedBombeiro.telefone}</p>
                      </div>
                      <div className="bg-pure-white rounded-lg p-4 border border-fog-gray/20 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <Mail className="w-5 h-5 text-radiant-orange" />
                          <span className="text-sm font-medium text-coal-black/60 uppercase tracking-wide">E-mail</span>
                        </div>
                        <p className="text-lg font-semibold text-coal-black break-all">{selectedBombeiro.email}</p>
                      </div>
                      <div className="bg-pure-white rounded-lg p-4 border border-fog-gray/20 lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <MapPin className="w-5 h-5 text-radiant-orange" />
                          <span className="text-sm font-medium text-coal-black/60 uppercase tracking-wide">Endereço</span>
                        </div>
                        <p className="text-lg font-semibold text-coal-black">{selectedBombeiro.endereco}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dados Funcionais */}
                  <div className="bg-radiant-orange/5 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 bg-radiant-orange/10 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-radiant-orange" />
                      </div>
                      <h4 className="text-xl font-bold text-coal-black">Dados Funcionais</h4>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-pure-white rounded-lg p-4 border border-fog-gray/20 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="w-5 h-5 text-radiant-orange" />
                          <span className="text-sm font-medium text-coal-black/60 uppercase tracking-wide">Data de Admissão</span>
                        </div>
                        <p className="text-lg font-semibold text-coal-black">{selectedBombeiro.dataAdmissao}</p>
                      </div>
                      <div className="bg-pure-white rounded-lg p-4 border border-fog-gray/20 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-radiant-orange" />
                            <span className="text-sm font-medium text-coal-black/60 uppercase tracking-wide">Documentos</span>
                          </div>
                          <button
                            onClick={() => openDocumentsModal(selectedBombeiro)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-radiant-orange/10 hover:bg-radiant-orange/20 text-radiant-orange rounded-lg transition-all duration-200 text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </button>
                        </div>
                        <p className="text-lg font-semibold text-coal-black">{selectedBombeiro.documentos} arquivos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer do Modal */}
              <div className="bg-fog-gray/20 border-t border-fog-gray/30 px-8 py-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 text-coal-black/70 hover:text-coal-black font-medium transition-colors rounded-lg hover:bg-fog-gray/30"
                  >
                    Fechar
                  </button>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => openDeleteModal(selectedBombeiro)}
                      className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                    >
                      <Trash2 className="w-5 h-5" />
                      Excluir
                    </button>
                    <button 
                      onClick={() => openEditModal(selectedBombeiro)}
                      className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-radiant-orange to-radiant-orange/80 text-pure-white rounded-xl hover:from-radiant-orange/90 hover:to-radiant-orange/70 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                    >
                      <Edit className="w-5 h-5" />
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Adicionar Bombeiro */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-coal-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-pure-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-fog-gray/20 flex flex-col">
              {/* Cabeçalho Premium */}
              <div className="bg-gradient-to-r from-radiant-orange to-radiant-orange/80 p-6 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pure-white/10 to-transparent transform -skew-x-12"></div>
                <div className="relative w-full">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-pure-white leading-tight mb-2">Adicionar Novo Bombeiro</h2>
                    <p className="text-pure-white/80 text-sm leading-relaxed">Preencha os dados do novo colaborador</p>
                  </div>
                  <button
                    onClick={closeAddModal}
                    className="absolute -top-2 -right-4 p-1 text-pure-white/70 hover:text-pure-white transition-all duration-200 z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Conteúdo do Modal - Com Scroll */}
              <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-pure-white to-fog-gray/5 scrollbar-thin scrollbar-thumb-radiant-orange/30 scrollbar-track-fog-gray/10">

                {/* Seção Dados Pessoais */}
                <div className="bg-pure-white rounded-xl border border-fog-gray/20 p-6 mb-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-coal-black mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-radiant-orange rounded-full"></div>
                    Dados Pessoais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nome */}
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Nome Completo *</label>
                      <input
                        type="text"
                        value={newBombeiro.nome || ''}
                        onChange={(e) => updateNewBombeiroField('nome', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50"
                        placeholder="Digite o nome completo"
                      />
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Telefone *</label>
                      <input
                        type="tel"
                        value={newBombeiro.telefone || ''}
                        onChange={(e) => updateNewBombeiroField('telefone', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-coal-black mb-2">Email *</label>
                      <input
                        type="email"
                        value={newBombeiro.email || ''}
                        onChange={(e) => updateNewBombeiroField('email', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50"
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção Dados Funcionais */}
                <div className="bg-pure-white rounded-xl border border-fog-gray/20 p-6 mb-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-coal-black mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-radiant-orange rounded-full"></div>
                    Dados Funcionais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Matrícula */}
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Matrícula *</label>
                      <input
                        type="text"
                        value={newBombeiro.matricula || ''}
                        onChange={(e) => updateNewBombeiroField('matricula', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50"
                        placeholder="Digite a matrícula"
                      />
                    </div>

                    {/* Função */}
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Função</label>
                      <select
                        value={newBombeiro.funcao || 'BA-GS'}
                        onChange={(e) => updateNewBombeiroField('funcao', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50"
                      >
                        <option value="BA-GS">BA-GS</option>
                        <option value="BA-CE">BA-CE</option>
                        <option value="BA-LR">BA-LR</option>
                        <option value="BA-MC">BA-MC</option>
                        <option value="BA-2">BA-2</option>
                      </select>
                    </div>

                    {/* Equipe */}
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Equipe</label>
                      <select
                        value={newBombeiro.equipe || 'Alfa'}
                        onChange={(e) => updateNewBombeiroField('equipe', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50"
                      >
                        <option value="Alfa">Equipe Alfa</option>
                        <option value="Bravo">Equipe Bravo</option>
                        <option value="Charlie">Equipe Charlie</option>
                        <option value="Delta">Equipe Delta</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Status</label>
                      <select
                        value={newBombeiro.status || 'Ativo'}
                        onChange={(e) => updateNewBombeiroField('status', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50"
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Férias">Férias</option>
                        <option value="Afastado">Afastado</option>
                        <option value="Licença">Licença</option>
                      </select>
                    </div>

                    {/* Data de Admissão */}
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Data de Admissão</label>
                      <input
                        type="date"
                        value={newBombeiro.dataAdmissao || ''}
                        onChange={(e) => updateNewBombeiroField('dataAdmissao', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50"
                      />
                    </div>

                    {/* Ferista */}
                    <div className="flex items-center justify-center">
                      <div className="bg-fog-gray/10 rounded-xl p-4 w-full">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="ferista"
                            checked={newBombeiro.ferista || false}
                            onChange={(e) => updateNewBombeiroField('ferista', e.target.checked)}
                            className="w-5 h-5 text-radiant-orange bg-pure-white border-fog-gray/30 rounded focus:ring-radiant-orange focus:ring-2"
                          />
                          <label htmlFor="ferista" className="text-sm font-semibold text-coal-black flex items-center gap-2">
                            <span className="bg-yellow-400 text-yellow-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">F</span>
                            Colaborador Ferista
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção Endereço */}
                <div className="bg-pure-white rounded-xl border border-fog-gray/20 p-6 mb-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-coal-black mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-radiant-orange rounded-full"></div>
                    Endereço
                  </h3>
                  <textarea
                    value={newBombeiro.endereco || ''}
                    onChange={(e) => updateNewBombeiroField('endereco', e.target.value)}
                    className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50 resize-none"
                    rows={3}
                    placeholder="Digite o endereço completo"
                  />
                </div>

              </div>
              
              {/* Rodapé Fixo com Botões */}
              <div className="border-t border-fog-gray/20 bg-pure-white p-6 flex justify-end gap-4 rounded-b-2xl">
                <button
                  onClick={closeAddModal}
                  className="px-8 py-3 border-2 border-fog-gray/30 text-coal-black rounded-xl hover:bg-fog-gray/10 hover:border-fog-gray/50 transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={addBombeiro}
                  className="bg-gradient-to-r from-radiant-orange to-radiant-orange/90 hover:from-radiant-orange/90 hover:to-radiant-orange text-pure-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Adicionar Colaborador
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Listagem de Documentos */}
        {isDocListModalOpen && selectedBombeiroForDocs && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Documentos Enviados - {selectedBombeiroForDocs.nome}
                </h2>
                <button
                  onClick={closeDocListModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Lista de Documentos Enviados */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Documentos ({(uploadedFiles[selectedBombeiroForDocs.id] || []).length})
                </h3>
                
                {(uploadedFiles[selectedBombeiroForDocs.id] || []).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum documento enviado ainda
                  </p>
                ) : (
                  <div className="space-y-2">
                    {(uploadedFiles[selectedBombeiroForDocs.id] || [])
                      .sort((a, b) => {
                        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                        const dateB = b.data_criacao ? new Date(b.data_criacao).getTime() : 0;
                        return dateB - dateA;
                      })
                      .map((documento, index) => (
                      <div key={documento.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(documento.nome_original)}
                          <div>
                            <p className="font-medium text-gray-800">{documento.nome_personalizado}</p>
                            {documento.nome_personalizado !== documento.nome_original && (
                              <p className="text-xs text-gray-500">Arquivo original: {documento.nome_original}</p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{formatFileSize(documento.tamanho)}</span>
                              {documento.created_at && (
                                <span>Enviado em: {new Date(documento.created_at).toLocaleString('pt-BR')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => viewDocument(documento)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-2"
                            title="Visualizar documento"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFile(documento, index)}
                            className="text-red-600 hover:text-red-800 transition-colors p-2"
                            title="Remover documento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-between space-x-3 mt-6">
                <button
                  onClick={() => {
                    setIsDocListModalOpen(false);
                    setIsDocModalOpen(true);
                  }}
                  className="bg-gradient-to-r from-radiant-orange to-radiant-orange/90 hover:from-radiant-orange/90 hover:to-radiant-orange text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Adicionar Mais Documentos
                </button>
                <button
                  onClick={closeDocListModal}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição */}
        {isEditModalOpen && editBombeiro && (
          <div className="fixed inset-0 bg-coal-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-pure-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-fog-gray/20 flex flex-col">
              {/* Cabeçalho Premium */}
              <div className="bg-gradient-to-r from-radiant-orange to-radiant-orange/80 p-6 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pure-white/10 to-transparent transform -skew-x-12"></div>
                <div className="relative w-full">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-pure-white leading-tight mb-2">Editar Bombeiro</h2>
                    <p className="text-pure-white/80 text-sm leading-relaxed">Altere as informações do colaborador</p>
                  </div>
                  <button
                    onClick={closeEditModal}
                    className="absolute -top-2 -right-4 p-1 text-pure-white/70 hover:text-pure-white transition-all duration-200 z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Conteúdo do Modal - Com Scroll */}
              <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-pure-white to-fog-gray/5 scrollbar-thin scrollbar-thumb-radiant-orange/30 scrollbar-track-fog-gray/10">

                {/* Seção Dados Pessoais */}
                <div className="bg-pure-white rounded-xl border border-fog-gray/20 p-6 mb-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-coal-black mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-radiant-orange rounded-full"></div>
                    Dados Pessoais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nome */}
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Nome Completo *</label>
                      <input
                        type="text"
                        value={editBombeiro.nome || ''}
                        onChange={(e) => updateEditBombeiroField('nome', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50"
                        placeholder="Digite o nome completo"
                      />
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Telefone *</label>
                      <input
                        type="tel"
                        value={editBombeiro.telefone || ''}
                        onChange={(e) => updateEditBombeiroField('telefone', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-coal-black mb-2">Email *</label>
                      <input
                        type="email"
                        value={editBombeiro.email || ''}
                        onChange={(e) => updateEditBombeiroField('email', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50"
                        placeholder="exemplo@email.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção Dados Funcionais */}
                <div className="bg-radiant-orange/5 rounded-xl border border-radiant-orange/10 p-6 mb-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-coal-black mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-radiant-orange rounded-full"></div>
                    Dados Funcionais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Matrícula */}
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Matrícula *</label>
                      <input
                        type="text"
                        value={editBombeiro.matricula || ''}
                        onChange={(e) => updateEditBombeiroField('matricula', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50"
                        placeholder="Digite a matrícula"
                      />
                    </div>

                    {/* Função */}
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Função *</label>
                      <select
                        value={editBombeiro.funcao || ''}
                        onChange={(e) => updateEditBombeiroField('funcao', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50"
                      >
                        <option value="">Selecione uma função</option>
                        <option value="Comandante">Comandante</option>
                        <option value="Subcomandante">Subcomandante</option>
                        <option value="Capitão">Capitão</option>
                        <option value="Tenente">Tenente</option>
                        <option value="Sargento">Sargento</option>
                        <option value="Cabo">Cabo</option>
                        <option value="Soldado">Soldado</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Status *</label>
                      <select
                        value={editBombeiro.status || ''}
                        onChange={(e) => updateEditBombeiroField('status', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50"
                      >
                        <option value="">Selecione um status</option>
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                        <option value="Licença">Licença</option>
                        <option value="Férias">Férias</option>
                      </select>
                    </div>

                    {/* Data de Admissão */}
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Data de Admissão *</label>
                      <input
                        type="date"
                        value={editBombeiro.dataAdmissao ? editBombeiro.dataAdmissao.split('/').reverse().join('-') : ''}
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          const formattedDate = date.toLocaleDateString('pt-BR');
                          updateEditBombeiroField('dataAdmissao', formattedDate);
                        }}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50"
                      />
                    </div>

                    {/* Ferista */}
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editBombeiro.ferista || false}
                          onChange={(e) => updateEditBombeiroField('ferista', e.target.checked)}
                          className="w-5 h-5 text-radiant-orange bg-pure-white border-fog-gray/30 rounded focus:ring-radiant-orange focus:ring-2 transition-all duration-200"
                        />
                        <span className="text-sm font-semibold text-coal-black">Ferista</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Seção Endereço */}
                <div className="bg-pure-white rounded-xl border border-fog-gray/20 p-6 mb-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-coal-black mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-radiant-orange rounded-full"></div>
                    Endereço
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold text-coal-black mb-2">Endereço Completo</label>
                    <textarea
                      value={editBombeiro.endereco || ''}
                      onChange={(e) => updateEditBombeiroField('endereco', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50 resize-none"
                      placeholder="Digite o endereço completo"
                    />
                  </div>
                </div>

                {/* Seção Equipe - Moderna e Profissional */}
                <div className="bg-gradient-to-br from-radiant-orange/5 to-radiant-orange/10 rounded-xl border border-radiant-orange/20 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-coal-black mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-radiant-orange rounded-full"></div>
                    Equipe de Trabalho
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['Alfa', 'Bravo', 'Charlie', 'Delta'] as const).map((equipe) => (
                      <button
                        key={equipe}
                        type="button"
                        onClick={() => openConfirmEquipeModal(equipe)}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                          editBombeiro.equipe === equipe
                            ? `${getEquipeColor(equipe)} border-current shadow-lg`
                            : 'bg-pure-white border-fog-gray/30 hover:border-radiant-orange/50 text-coal-black'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center font-bold text-sm ${
                            editBombeiro.equipe === equipe
                              ? 'bg-white/20 text-current'
                              : 'bg-radiant-orange/10 text-radiant-orange'
                          }`}>
                            {equipe[0]}
                          </div>
                          <span className="font-semibold text-sm">{equipe}</span>
                        </div>
                        {editBombeiro.equipe === equipe && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-coal-black/60 mt-3 text-center">
                    Clique em uma equipe para alterar. Uma confirmação será solicitada.
                  </p>
                </div>
              </div>

              {/* Footer do Modal */}
              <div className="bg-fog-gray/10 border-t border-fog-gray/20 px-6 py-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={closeEditModal}
                    className="px-6 py-3 text-coal-black/70 hover:text-coal-black font-medium transition-colors rounded-lg hover:bg-fog-gray/30"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveEditBombeiro}
                    className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-radiant-orange to-radiant-orange/80 text-pure-white rounded-xl hover:from-radiant-orange/90 hover:to-radiant-orange/70 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Mudança de Equipe */}
        {isConfirmEquipeModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-pure-white rounded-2xl shadow-2xl max-w-md w-full border border-fog-gray/20">
              {/* Header */}
              <div className="bg-gradient-to-r from-radiant-orange to-radiant-orange/80 p-6 rounded-t-2xl">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Confirmar Mudança de Equipe</h3>
                  <p className="text-white/80 text-sm">Esta ação alterará a equipe do bombeiro</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <p className="text-coal-black mb-4">
                    Tem certeza que deseja alterar a equipe de <strong>{editBombeiro.nome}</strong> para:
                  </p>
                  <div className={`inline-flex items-center px-6 py-3 rounded-xl font-semibold ${getEquipeColor(newEquipe)}`}>
                    Equipe {newEquipe}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsConfirmEquipeModalOpen(false)}
                    className="flex-1 px-4 py-3 text-coal-black/70 hover:text-coal-black font-medium transition-colors rounded-lg hover:bg-fog-gray/30 border border-fog-gray/30"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmEquipeChange}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-radiant-orange to-radiant-orange/80 text-pure-white rounded-lg hover:from-radiant-orange/90 hover:to-radiant-orange/70 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Exclusão de Bombeiro */}
        {isDeleteModalOpen && bombeiroToDelete && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-pure-white rounded-2xl shadow-2xl max-w-md w-full border border-red-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-2">ATENÇÃO: Exclusão Permanente</h3>
                <p className="text-white/90 text-sm text-center">Esta ação não pode ser desfeita</p>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <p className="text-coal-black mb-4">
                    Você está prestes a excluir <strong className="text-red-600">{bombeiroToDelete.nome}</strong> e todos os seus dados permanentemente.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="text-left">
                         <p className="text-red-800 font-semibold text-sm mb-1">Dados que serão excluídos:</p>
                         <ul className="text-red-700 text-sm space-y-1">
                           <li>• Informações pessoais e funcionais</li>
                           <li>• Todos os documentos ({bombeiroToDelete.documentos} arquivos)</li>
                           <li>• Registros administrativos</li>
                         </ul>
                         <p className="text-green-700 font-semibold text-sm mt-3 mb-1">Dados que serão preservados:</p>
                         <ul className="text-green-700 text-sm space-y-1">
                           <li>• Ocorrências em que participou (histórico)</li>
                           <li>• Nome nas ocorrências como referência</li>
                         </ul>
                       </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-coal-black mb-2">
                      Para confirmar, digite exatamente:
                    </label>
                    <div className="bg-gray-100 rounded-lg p-3 mb-3">
                      <code className="text-sm font-mono text-red-600 font-bold">
                        EXCLUIR {bombeiroToDelete.nome.toUpperCase()}
                      </code>
                    </div>
                    <input
                      type="text"
                      value={deleteConfirmationText}
                      onChange={(e) => setDeleteConfirmationText(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors text-center font-mono"
                      placeholder="Digite o texto de confirmação"
                      disabled={isDeleting}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={closeDeleteModal}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-3 text-coal-black/70 hover:text-coal-black font-medium transition-colors rounded-lg hover:bg-fog-gray/30 border border-fog-gray/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={deleteBombeiro}
                    disabled={isDeleting || deleteConfirmationText !== `EXCLUIR ${bombeiroToDelete.nome.toUpperCase()}`}
                    className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500"
                  >
                    {isDeleting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Excluindo...
                      </div>
                    ) : (
                      'Excluir Permanentemente'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Documentos */}
        {isDocModalOpen && selectedBombeiroForDocs && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Upload de Documentos - {selectedBombeiroForDocs.nome}
                </h2>
                <button
                  onClick={closeDocModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Área de Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecionar Documentos
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-radiant-orange transition-colors">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Clique para selecionar arquivos</p>
                    <p className="text-sm text-gray-500">
                      Suporta: PDF, Excel, Imagens, Word
                    </p>
                  </label>
                </div>
              </div>

              {/* Lista de Arquivos Pendentes */}
              {pendingFiles.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Arquivos Selecionados ({pendingFiles.length})
                  </h3>
                  
                  <div className="space-y-3">
                    {pendingFiles.map((file, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file.name)}
                            <div>
                              <p className="text-sm text-gray-600">Arquivo original: {file.name}</p>
                              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removePendingFile(index)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1"
                            title="Remover arquivo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Campo para editar nome do documento */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome do documento:
                          </label>
                          <input
                            type="text"
                            value={fileNames[index] || file.customName || file.name}
                            onChange={(e) => updateFileName(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radiant-orange/20 focus:border-radiant-orange transition-colors text-sm"
                            placeholder="Digite o nome do documento"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeDocModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                {pendingFiles.length > 0 && (
                  <button
                    onClick={sendFiles}
                    disabled={isUploading}
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${
                      isUploading 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-gradient-to-r from-radiant-orange to-radiant-orange/90 hover:from-radiant-orange/90 hover:to-radiant-orange text-white'
                    }`}
                  >
                    {isUploading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Enviando...
                      </div>
                    ) : (
                      `Enviar Documentos (${pendingFiles.length})`
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Componente de Notificação */}
        {notification.show && (
          <div className={`fixed top-4 right-4 z-[60] transform transition-all duration-300 ease-in-out ${
            notification.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}>
            <div className={`flex items-center space-x-3 px-6 py-4 rounded-lg shadow-lg border-l-4 backdrop-blur-sm ${
              notification.type === 'success' 
                ? 'bg-green-50/95 border-green-500 text-green-800' 
                : 'bg-red-50/95 border-red-500 text-red-800'
            }`}>
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                className={`flex-shrink-0 ml-4 inline-flex text-sm ${
                  notification.type === 'success' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
                } transition-colors`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </SidebarDemo>
  );
}
