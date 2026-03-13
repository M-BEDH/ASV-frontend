import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';

export type ConfirmConfig = {
  title: string;
  message: string;
  destructive: boolean;
  onConfirm: () => void;
};

type CrudOptions<TItem extends { id: string }, TForm> = {
  fetchAll: () => Promise<TItem[]>;
  createItem: (payload: any) => Promise<any>;
  updateItem: (id: string, payload: any) => Promise<any>;
  deleteItem: (id: string) => Promise<void>;
  emptyForm: TForm;
  toPayload: (form: TForm) => any;
  itemToForm: (item: TItem) => TForm;
  validate: (form: TForm) => string | null;
  labels: {
    created: string;
    updated: string;
    deleted: string;
    deleteTitle?: string;
    deleteMessage: (item: TItem) => string;
  };
};

export function useCrud<TItem extends { id: string }, TForm>(opts: CrudOptions<TItem, TForm>) {
  const { showToast } = useToast();
  const [items, setItems] = useState<TItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<TItem | null>(null);
  const [form, setForm] = useState<TForm>(opts.emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);

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

  useEffect(() => { fetchData(); }, []);

  const openCreate = (overrides?: Partial<TForm>) => {
    setEditTarget(null);
    setForm({ ...opts.emptyForm, ...overrides });
    setError('');
    setModalVisible(true);
  };

  const openEdit = (item: TItem) => {
    setEditTarget(item);
    setForm(opts.itemToForm(item));
    setError('');
    setModalVisible(true);
  };

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
      if (editTarget) {
        await opts.updateItem(editTarget.id, payload);
        setModalVisible(false);
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
