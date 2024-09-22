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
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-80 space-y-8">
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
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex">
          <Button disabled={form.formState.isSubmitting} type="submit">
            {$t("submit")}{" "}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Page() {
  const { load, value, setValue, reload } = useStoreValue(
    "store.config..workspace",
  );
  const { toast } = useToast();
  const $t = useI18n();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await run("pwd", values.workspace)
      .then(async () => {
        await setValue(values.workspace)
          .then(async () => {
            toast({
              title: $t("submit.success"),
              description: new Date().toLocaleString(),
            });
            await reload();
          })
          .catch((e) => {
            toast({ title: $t("submit.fail"), description: e.message });
          });
      })
      .catch(() => {
        toast({
          title: $t("submit.fail"),
          description: $t("invalid location"),
        });
      });
  }

  if (!load) {
    return <FormSkeleton length={2} />;
  }
  return (
    <ConfigForm onSubmit={onSubmit} workspace={{ workspace: value || "" }} />
  );
}
