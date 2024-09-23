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
import { run } from "@/tauri/shell";
import { useRouter } from "next/navigation";
import { Check, useCheck } from "@/components/layout/Check";
import { useCallback } from "react";
import Link from "next/link";
const formSchema = z.object({
  workspace: z.string().min(1),
});

export function ConfigForm(props: {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  workspace: z.infer<typeof formSchema>;
}) {
  const $t = useI18n();
  const { onSubmit, workspace } = props;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: workspace,
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="workspace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{$t("config.workspace")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={$t("config.workspace.placeholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage trans={$t} />
            </FormItem>
          )}
        />
        <div className="flex space-x-6">
          {workspace && (
            <Button
              className="w-full"
              disabled={form.formState.isSubmitting || form.formState.disabled}
              type="button"
              variant="secondary"
              asChild
            >
              <Link href="/workspace">{$t("cancel")}</Link>
            </Button>
          )}
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
  const { load, value, setValue } = useStoreValue("store.config..workspace");
  const { toast } = useToast();
  const $t = useI18n();
  const router = useRouter();
  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      const res = await run(
        "git rev-parse --show-toplevel",
        values.workspace.trim(),
      ).catch((e) => {
        console.error(e, values);
      });
      if (!res) {
        toast({
          title: $t("submit.fail"),
          description: $t("invalid location"),
        });
      } else {
        await setValue(res.trim())
          .then(() => router.push("/workspace"))
          .catch((e) => {
            toast({ title: $t("submit.fail"), description: e.message });
          });
      }
    },
    [$t, router, setValue, toast],
  );
  const { allState } = useCheck();

  return (
    <div className="mx-auto mt-20 flex w-[500px] flex-col space-y-2 rounded border p-5 px-10">
      {load ? (
        <>
          <Check />
          {allState === "success" && (
            <ConfigForm
              onSubmit={onSubmit}
              workspace={{ workspace: value || "" }}
            />
          )}
        </>
      ) : (
        <FormSkeleton length={2} />
      )}
    </div>
  );
}
