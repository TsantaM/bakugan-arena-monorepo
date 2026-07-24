'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Section from "@/components/ui/section"
import {
  activateBotWeightVersion,
  activateDefaultBotWeights,
  addTrainingItemFromImport,
  addTrainingItemsFromDb,
  clearBotTrainingSet,
  listBotTrainingItems,
  listBotWeightVersions,
  listTrainingReplays,
  removeBotTrainingItems,
  trainBotFromTrainingSet,
} from "@/src/actions/admin/bot-training"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Brain, FileJson, Loader2, Trash2, Upload } from "lucide-react"
import { useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export default function BotTrainingPanel() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedReplayIds, setSelectedReplayIds] = useState<string[]>([])
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [importLearnFrom, setImportLearnFrom] = useState<"player1" | "player2">("player1")
  const [trainLabel, setTrainLabel] = useState("")

  const replaysQuery = useQuery({
    queryKey: ["admin", "bot-training", "replays"],
    queryFn: listTrainingReplays,
  })

  const itemsQuery = useQuery({
    queryKey: ["admin", "bot-training", "items"],
    queryFn: listBotTrainingItems,
  })

  const weightsQuery = useQuery({
    queryKey: ["admin", "bot-training", "weights"],
    queryFn: listBotWeightVersions,
  })

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "bot-training", "items"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "bot-training", "weights"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "bot-training", "replays"] }),
    ])
  }

  const addFromDbMutation = useMutation({
    mutationFn: () => addTrainingItemsFromDb(selectedReplayIds),
    onSuccess: async ({ added }) => {
      toast.success(t('toasts.replaysAdded', { n: added }))
      setSelectedReplayIds([])
      await invalidateAll()
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : t('toasts.addReplaysFailed')),
  })

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const text = await file.text()
      return addTrainingItemFromImport({
        title: file.name.replace(/\.json$/i, ""),
        replayJson: text,
        learnFrom: importLearnFrom,
      })
    },
    onSuccess: async () => {
      toast.success(t('toasts.replayImported'))
      if (fileRef.current) fileRef.current.value = ""
      await invalidateAll()
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : t('toasts.importFailed')),
  })

  const removeMutation = useMutation({
    mutationFn: () => removeBotTrainingItems(selectedItemIds),
    onSuccess: async ({ removed }) => {
      toast.success(t('toasts.itemsRemoved', { n: removed }))
      setSelectedItemIds([])
      await invalidateAll()
    },
    onError: () => toast.error(t('toasts.removeFailed')),
  })

  const clearMutation = useMutation({
    mutationFn: clearBotTrainingSet,
    onSuccess: async () => {
      toast.success(t('toasts.setCleared'))
      setSelectedItemIds([])
      await invalidateAll()
    },
    onError: () => toast.error(t('toasts.clearFailed')),
  })

  const trainMutation = useMutation({
    mutationFn: () => trainBotFromTrainingSet(trainLabel || undefined),
    onSuccess: async (created) => {
      toast.success(t('toasts.trainingDone', { version: created.version, n: created.metrics.decisionsAnalyzed }))
      setTrainLabel("")
      await invalidateAll()
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : t('toasts.trainingFailed')),
  })

  const activateMutation = useMutation({
    mutationFn: (id: string) => activateBotWeightVersion(id),
    onSuccess: async () => {
      toast.success(t('toasts.weightsActivated'))
      await invalidateAll()
    },
    onError: () => toast.error(t('toasts.activateFailed')),
  })

  const defaultMutation = useMutation({
    mutationFn: activateDefaultBotWeights,
    onSuccess: async () => {
      toast.success(t('toasts.defaultsActivated'))
      await invalidateAll()
    },
    onError: () => toast.error(t('toasts.defaultsFailed')),
  })

  const activeVersion = useMemo(
    () => weightsQuery.data?.find((w) => w.isActive),
    [weightsQuery.data]
  )

  const toggleId = (list: string[], id: string, setter: (next: string[]) => void) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

  return (
    <Section className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">{t('botTraining.pageTitle')}</h2>
        <p className="text-muted-foreground text-sm mt-1 max-w-3xl">
          {t('botTraining.intro')}
        </p>
        {activeVersion && (
          <p className="text-sm mt-2">
            {t('botTraining.activeVersion')} <span className="font-medium">{activeVersion.label}</span>{" "}
            ({activeVersion.version})
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('botTraining.replaysFromDb')}</CardTitle>
            <CardDescription>
              {t('botTraining.replaysFromDbDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-72 overflow-y-auto space-y-2">
            {replaysQuery.isLoading && <Loader2 className="animate-spin" />}
            {(replaysQuery.data ?? []).map((replay) => (
              <label key={replay.id} className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selectedReplayIds.includes(replay.id)}
                  onChange={() => toggleId(selectedReplayIds, replay.id, setSelectedReplayIds)}
                />
                <span>
                  <span className="font-medium">{replay.title}</span>
                  <span className="block text-muted-foreground text-xs">
                    {t('botTraining.winnerLine', {
                      w: replay.room?.winner ?? t('botTraining.winnerUnknown'),
                      date: new Date(replay.createdAt).toLocaleString(),
                    })}
                  </span>
                </span>
              </label>
            ))}
            {!replaysQuery.isLoading && (replaysQuery.data?.length ?? 0) === 0 && (
              <p className="text-sm text-muted-foreground">{t('botTraining.noReplays')}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button
              disabled={!selectedReplayIds.length || addFromDbMutation.isPending}
              onClick={() => addFromDbMutation.mutate()}
            >
              {addFromDbMutation.isPending ? <Loader2 className="animate-spin" /> : <Brain />}
              {t('botTraining.addToSet')}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('botTraining.importTitle')}</CardTitle>
            <CardDescription>
              {t('botTraining.importDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="learnFrom"
                  checked={importLearnFrom === "player1"}
                  onChange={() => setImportLearnFrom("player1")}
                />
                {t('botTraining.learnP1')}
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="learnFrom"
                  checked={importLearnFrom === "player2"}
                  onChange={() => setImportLearnFrom("player2")}
                />
                {t('botTraining.learnP2')}
              </label>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) importMutation.mutate(file)
              }}
            />
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              disabled={importMutation.isPending}
              onClick={() => fileRef.current?.click()}
            >
              {importMutation.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
              {tCommon('actions.import')}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('botTraining.trainingSet')}</CardTitle>
          <CardDescription>
            {t('botTraining.trainingSetDesc', { n: itemsQuery.data?.length ?? 0 })}
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-64 overflow-y-auto space-y-2">
          {(itemsQuery.data ?? []).map((item) => (
            <label key={item.id} className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={selectedItemIds.includes(item.id)}
                onChange={() => toggleId(selectedItemIds, item.id, setSelectedItemIds)}
              />
              <span>
                <span className="font-medium">{item.title}</span>
                <span className="block text-muted-foreground text-xs">
                  {item.source} · learn from {item.learnFromUserId}
                </span>
              </span>
            </label>
          ))}
          {!itemsQuery.isLoading && (itemsQuery.data?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground">{t('botTraining.emptySet')}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={!selectedItemIds.length || removeMutation.isPending}
            onClick={() => removeMutation.mutate()}
          >
            {removeMutation.isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
            {t('botTraining.removeSelected')}
          </Button>
          <Button
            variant="destructive"
            disabled={!itemsQuery.data?.length || clearMutation.isPending}
            onClick={() => {
              if (window.confirm(t('botTraining.clearConfirm'))) clearMutation.mutate()
            }}
          >
            {t('botTraining.clearAll')}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('botTraining.trainDeploy')}</CardTitle>
          <CardDescription>
            {t('botTraining.trainDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            className="border rounded-md px-3 py-2 text-sm w-full max-w-md bg-background"
            placeholder={t('botTraining.labelPlaceholder')}
            value={trainLabel}
            onChange={(e) => setTrainLabel(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!itemsQuery.data?.length || trainMutation.isPending}
              onClick={() => trainMutation.mutate()}
            >
              {trainMutation.isPending ? <Loader2 className="animate-spin" /> : <Brain />}
              {t('botTraining.trainFromSet')}
            </Button>
            <Button
              variant="outline"
              disabled={defaultMutation.isPending}
              onClick={() => defaultMutation.mutate()}
            >
              {defaultMutation.isPending ? <Loader2 className="animate-spin" /> : <FileJson />}
              {t('botTraining.activateDefaults')}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-2">
          <p className="text-sm font-medium">{t('botTraining.weightVersions')}</p>
          <div className="max-h-64 overflow-y-auto space-y-2 w-full">
            {(weightsQuery.data ?? []).map((version) => (
              <div
                key={version.id}
                className="flex flex-wrap items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium">
                    {version.label}{" "}
                    {version.isActive && (
                      <span className="text-xs text-green-600 font-normal">{t('botTraining.activeBadge')}</span>
                    )}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {version.version} · {version.metrics.decisionsAnalyzed} decisions ·{" "}
                    {version.metrics.replaysUsed} replays
                    {typeof version.metrics.winsUsed === "number" && (
                      <>
                        {" "}
                        · {version.metrics.winsUsed}W/{version.metrics.lossesUsed ?? 0}L
                      </>
                    )}{" "}
                    · {new Date(version.createdAt).toLocaleString()}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={version.isActive ? "secondary" : "default"}
                  disabled={version.isActive || activateMutation.isPending}
                  onClick={() => activateMutation.mutate(version.id)}
                >
                  {version.isActive ? t('botTraining.active') : t('botTraining.activate')}
                </Button>
              </div>
            ))}
            {!weightsQuery.isLoading && (weightsQuery.data?.length ?? 0) === 0 && (
              <p className="text-sm text-muted-foreground">
                {t('botTraining.noVersions')}
              </p>
            )}
          </div>
        </CardFooter>
      </Card>
    </Section>
  )
}
