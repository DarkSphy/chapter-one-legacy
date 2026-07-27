import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  fetchChild,
  fetchMoments,
  createMoment,
  deleteMoment,
  updateMomentStory,
  upsertChild,
  getSignedUrl as signUrl,
  fetchCustomChapters,
  upsertCustomChapter,
  deleteCustomChapter,
  fetchCustomCategories,
  upsertCustomCategory,
  deleteCustomCategory,
  fetchCustomFeelings,
  upsertCustomFeeling,
  deleteCustomFeeling,
} from "@/services/library";
import type { Child, MomentInput } from "@/types";

export function useChild() {
  return useQuery({ queryKey: ["child"], queryFn: fetchChild });
}

export function useCoverSettings(childId: string) {
  return useQuery({ queryKey: ["coverSettings", childId], queryFn: () => fetchCoverSettings(childId) });
}

export function useCustomChapters() {
  return useQuery({ queryKey: ["chapters"], queryFn: fetchCustomChapters });
}

export function useUpsertChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, title, subtitle, position }: { slug: string; title: string; subtitle?: string; position?: number }) =>
      upsertCustomChapter(slug, title, subtitle, position),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chapters"] });
      qc.invalidateQueries({ queryKey: ["moments"] });
    },
  });
}

export function useDeleteChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => deleteCustomChapter(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chapters"] });
      qc.invalidateQueries({ queryKey: ["moments"] });
    },
  });
}

export function useCustomCategories() {
  return useQuery({ queryKey: ["categories"], queryFn: fetchCustomCategories });
}

export function useUpsertCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, oldName }: { name: string; oldName?: string }) => upsertCustomCategory(name, oldName),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => deleteCustomCategory(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useCustomFeelings() {
  return useQuery({ queryKey: ["feelings"], queryFn: fetchCustomFeelings });
}

export function useUpsertFeeling() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ label, emoji, oldLabel }: { label: string; emoji: string; oldLabel?: string }) => upsertCustomFeeling(label, emoji, oldLabel),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feelings"] }),
  });
}

export function useDeleteFeeling() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (label: string) => deleteCustomFeeling(label),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feelings"] }),
  });
}

export function useSaveChild() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<Child>) => upsertChild(values),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["child"] }),
  });
}

export function useMoments() {
  return useQuery({ queryKey: ["moments"], queryFn: fetchMoments });
}

export function useCreateMoment(childId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MomentInput) => createMoment(input, childId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["moments"] });
      qc.invalidateQueries({ queryKey: ["chapters"] });
    },
  });
}

export function useUpdateStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, story }: { id: string; story: string }) => updateMomentStory(id, story),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["moments"] }),
  });
}

export function useDeleteMoment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMoment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["moments"] }),
  });
}

/** Resolve um caminho privado do storage em uma URL assinada. */
export function useSignedUrl(path?: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (!path) {
      setUrl(null);
      return;
    }
    signUrl(path).then((value) => {
      if (active) setUrl(value);
    });
    return () => {
      active = false;
    };
  }, [path]);
  return url;
}

