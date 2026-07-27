import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  fetchChild,
  fetchMoments,
  createMoment,
  deleteMoment,
  updateMomentStory,
  upsertChild,
  signUrl,
  fetchCustomChapters,
} from "@/services/library";
import type { Child, MomentInput } from "@/types";

export function useChild() {
  return useQuery({ queryKey: ["child"], queryFn: fetchChild });
}

export function useCustomChapters() {
  return useQuery({ queryKey: ["chapters"], queryFn: fetchCustomChapters });
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

