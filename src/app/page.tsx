"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStoreValue } from "@/components/layout/Store";
import { FormSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n";
import { useRouter } from "next/navigation";
import { Check, useCheck } from "@/components/layout/Check";
import { useCallback } from "react";
import { invoke, InvokeFn } from "@/tauri/invoke";
import { StoreKey } from "@/tauri/store";

const formSchema = z.object({
  workspace: z.string().min(1),
  vercelTeam: z.string().min(1),
  vercelToken: z.string().min(1),
});

export function ConfigForm(props: {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  defaultValues: z.infer<typeof formSchema>;
}) {
  const $t = useI18n();
  const { onSubmit, defaultValues } = props;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
            {$t("config.basic")}
          </h3>
          <FormField
            control={form.control}
            name="workspace"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{$t("config.workspace")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage trans={$t} />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-2">
          <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
            {$t("config.vercel")}
          </h3>
          <FormField
            control={form.control}
            name="vercelTeam"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{$t("config.vercel.team")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage trans={$t} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vercelToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{$t("config.vercel.token")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage trans={$t} />
              </FormItem>
            )}
          />
        </div>
        <div className="flex space-x-6 pt-6">
          <Button
            className="w-full"
            disabled={form.formState.isSubmitting || form.formState.disabled}
            type="submit"
          >
            {$t("submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Page() {
  const workspace = useStoreValue(StoreKey.WORKSPACE);
  const vercelTeam = useStoreValue(StoreKey.VERCEL_TEAM);
  const vercelToken = useStoreValue(StoreKey.VERCEL_TOKEN);
  const { toast } = useToast();
  const $t = useI18n();
  const router = useRouter();
  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      const res = await invoke(InvokeFn.GIT_ROOT).catch((e) => {
        toast({
          title: $t("submit.fail"),
          description: $t("invalid location"),
        });
        console.error(e);
      });
      if (!res) return;
      await Promise.all([
        workspace.setValue(res.trim()),
        vercelTeam.setValue(values.vercelTeam),
        vercelToken.setValue(values.vercelToken),
      ])
        .then(() => router.push("/workspace"))
        .catch((e) => {
          toast({ title: $t("submit.fail"), description: e.message });
        });
    },
    [toast, $t, workspace, vercelTeam, vercelToken, router],
  );
  const { allState } = useCheck();

  return (
    <div className="mx-auto my-20 flex w-[500px] flex-col space-y-2 rounded border p-5 px-10">
      {workspace.load ? (
        <>
          <Check />
          {allState === "success" && (
            <ConfigForm
              onSubmit={onSubmit}
              defaultValues={{
                workspace: workspace.value || "",
                vercelTeam: vercelTeam.value || "",
                vercelToken: vercelToken.value || "",
              }}
            />
          )}
        </>
      ) : (
        <FormSkeleton length={2} />
      )}
    </div>
  );
}
