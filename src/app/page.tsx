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
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n";
import { useRouter } from "next/navigation";
import { Check, useCheck } from "@/components/layout/check-dialog";
import { useCallback, useRef, useState } from "react";
import { invoke, InvokeFn } from "@/tauri/invoke";
import { rsConfig, StoreKey } from "@/tauri/store";
import { ErrMsg } from "@/lib/enum";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formSchema = z.object({
  workspace: z.string().min(1),
  vercelTeam: z.string().min(1),
  vercelToken: z.string().min(1),
});

export default function Page() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const $t = useI18n();
  const button = useRef<HTMLButtonElement | null>(null);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: async () => {
      const [workspace, vercelTeam, vercelToken] = await Promise.all([
        rsConfig(StoreKey.WORKSPACE).get(""),
        rsConfig(StoreKey.VERCEL_TEAM).get(""),
        rsConfig(StoreKey.VERCEL_TOKEN).get(""),
      ]);
      return {
        workspace,
        vercelTeam,
        vercelToken,
      };
    },
  });
  const addToSafeDirectory = useCallback(async () => {
    await invoke(InvokeFn.GIT_ADD_SAFE_DIRECTORY, {
      path: form.getValues("workspace"),
    });
    //todo re submit
    toast({
      title: $t("submit.success"),
      description: $t("invalid location"),
    });
    button.current?.click();
    setOpen(false);
  }, [$t, form, toast]);
  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      const res = await invoke(InvokeFn.GIT_ROOT, {
        path: values.workspace,
      }).catch((e: ErrMsg) => {
        switch (e) {
          case ErrMsg.WorkspaceIsNotInSafeDirectory: {
            setOpen(true);
            return;
          }
          default: {
            toast({
              title: $t("submit.fail"),
              description: $t("invalid location"),
            });
            console.error(e);
            return;
          }
        }
      });
      if (!res) return;
      await Promise.all([
        rsConfig(StoreKey.WORKSPACE).set(res.trim()),
        rsConfig(StoreKey.VERCEL_TEAM).set(values.vercelTeam),
        rsConfig(StoreKey.VERCEL_TOKEN).set(values.vercelToken),
      ])
        .then(() => router.push("/workspace"))
        .catch((e) => {
          toast({ title: $t("submit.fail"), description: e.message });
        });
    },
    [toast, $t, router],
  );
  const { allState } = useCheck();

  return (
    <div className="mx-auto my-20 flex w-[500px] flex-col space-y-2 rounded border p-5 px-10">
      <Check />
      {allState === "success" && (
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
                ref={button}
                className="w-full"
                disabled={
                  form.formState.isSubmitting || form.formState.disabled
                }
                type="submit"
              >
                {$t("submit")}
              </Button>
            </div>
          </form>
        </Form>
      )}
      {/*todo i18n*/}
      <AlertDialog open={open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={addToSafeDirectory}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
