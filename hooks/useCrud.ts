import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useToast } from '../context/ToastContext';

// Configuration de la modale de confirmation (suppression)
export type ConfirmConfig = {
  title: string;
  message: string;
  destructive: boolean; // affiche le bouton en rouge
  onConfirm: () => void;
};

// Options à fournir par chaque écran qui utilise ce hook
// TItem extends { id: string } : le hook a besoin d'un id (ex. editTarget.id dans handleSave) quel que soit le type concret fourni
type CrudOptions<TItem extends { id: string }, TForm> = {
  fetchAll: () => Promise<TItem[]>;           // charge la liste depuis l'API
  createItem: (payload: any) => Promise<any>; // crée un élément
  updateItem: (id: string, payload: any) => Promise<any>; // modifie un élément
  deleteItem: (id: string) => Promise<void>;  // supprime un élément
  emptyForm: TForm;                           // valeurs initiales du formulaire vide
  toPayload: (form: TForm) => any;            // convertit le formulaire en payload API
  itemToForm: (item: TItem) => TForm;         // pré-remplit le formulaire en mode édition
  validate: (form: TForm) => string | null;   // retourne un message d'erreur ou null si valide
  labels: {
    created: string;                          // toast affiché après création
    updated: string;                          // toast affiché après modification
    deleted: string;                          // toast affiché après suppression
    deleteTitle?: string;                     // titre de la modale de confirmation
    deleteMessage: (item: TItem) => string;   // message de confirmation personnalisé par élément
  };
};

// Hook générique qui centralise la logique CRUD commune à tous les écrans liste + formulaire.
// Évite de dupliquer states, fetch, validation et toasts dans chaque écran.
// Chaque écran qui utilise ce hook doit simplement fournir une configuration spécifique via les options (fonctions d'API, conversion formulaire/payload, validation, labels).
export function useCrud<TItem extends { id: string }, TForm>(opts: CrudOptions<TItem, TForm>) {
  const { showToast } = useToast();

  // États partagés entre tous les écrans CRUD
  const [items, setItems] = useState<TItem[]>([]);
  const [loading, setLoading] = useState(true);       // chargement initial
  const [refreshing, setRefreshing] = useState(false); // pull-to-refresh
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<TItem | null>(null); // null = création, item = édition
  const [form, setForm] = useState<TForm>(opts.emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);

  // Charge la liste et se relance automatiquement à chaque fois que l'écran prend le focus
  const fetchData = useCallback(async () => {
    try {
      const data = await opts.fetchAll();
      setItems(data);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  // Ouvre le formulaire en mode création, avec des valeurs optionnelles pré-remplies
  const openCreate = (overrides?: Partial<TForm>) => {
    setEditTarget(null);
    setForm({ ...opts.emptyForm, ...overrides });
    setError('');
    setModalVisible(true);
  };

  // Ouvre le formulaire en mode édition en pré-remplissant les champs depuis l'élément sélectionné
  const openEdit = (item: TItem) => {
    setEditTarget(item);
    setForm(opts.itemToForm(item));
    setError('');
    setModalVisible(true);
  };

  // Valide puis envoie le formulaire — crée ou met à jour selon qu'un editTarget est défini
  const handleSave = async () => {
    const validationError = opts.validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = opts.toPayload(form);
      // editTarget non-null = mode édition (défini par openEdit) → update ; sinon mode création → create
      if (editTarget) {
        await opts.updateItem(editTarget.id, payload);
        setModalVisible(false);
        // Délai pour laisser la modale se fermer avant d'afficher le toast
        setTimeout(() => showToast(opts.labels.updated), 400);
      } else {
        await opts.createItem(payload);
        setModalVisible(false);
        setTimeout(() => showToast(opts.labels.created), 400);
      }
      fetchData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Affiche une modale de confirmation avant de supprimer
  const handleDelete = (item: TItem) => {
    setConfirm({
      title: opts.labels.deleteTitle ?? 'Supprimer',
      message: opts.labels.deleteMessage(item),
      destructive: true,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await opts.deleteItem(item.id);
          showToast(opts.labels.deleted);
          fetchData();
        } catch (e: any) {
          showToast(e.message || 'Erreur lors de la suppression', 'error');
        }
      },
    });
  };

  // Ce que le hook expose aux écrans qui l'utilisent
  return {
    items,
    loading,
    refreshing,
    setRefreshing,
    fetchData,
    modalVisible,
    setModalVisible,
    editTarget,
    form,
    setForm,
    saving,
    error,
    confirm,
    hideConfirm: () => setConfirm(null),
    openCreate,
    openEdit,
    handleSave,
    handleDelete,
  };
}
