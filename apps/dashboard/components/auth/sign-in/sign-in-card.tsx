"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  LockIcon,
  MailIcon,
} from "lucide-react";

import { routes } from "@workspace/routes";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Button, buttonVariants } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@workspace/ui/components/form";
import { InputPassword } from "@workspace/ui/components/input";
import { InputWithAdornments } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";

import { signInWithCredentials } from "~/actions/auth/sign-in-with-credentials";
import { OrContinueWith } from "~/components/auth/helpers/or-continue-with";
import { useZodForm } from "~/hooks/use-zod-form";
import GoogleLogo from "~/public/assets/logos/google-logo.svg";
import {
  passThroughCredentialsSchema,
  type PassThroughCredentialsSchema,
} from "~/schemas/auth/pass-through-credentials-schema";

export function SignInCard({
  className,
  ...other
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>();

  const methods = useZodForm({
    schema: passThroughCredentialsSchema,
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const canSubmit = !isLoading && !methods.formState.isSubmitting;

  const onSubmit = async (
    values: PassThroughCredentialsSchema
  ): Promise<void> => {
    if (!canSubmit) return;
    setIsLoading(true);

    const result = await signInWithCredentials(values);
    if (result?.validationErrors?._errors) {
      setErrorMessage(result.validationErrors._errors[0]);
      setIsLoading(false);
    } else if (result?.serverError) {
      setErrorMessage(result.serverError);
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={cn(
        "w-full px-4 py-2 border-transparent dark:border-border",
        className
      )}
      {...other}
    >
      <CardHeader>
        <CardTitle className="text-base lg:text-lg">
          Sign in to your account
        </CardTitle>
        <CardDescription>
          Welcome back! Please sign in to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Form {...methods}>
          <form
            className="flex flex-col gap-4"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <FormField
              control={methods.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <InputWithAdornments
                      {...field}
                      type="email"
                      maxLength={255}
                      autoCapitalize="off"
                      autoComplete="username"
                      startAdornment={<MailIcon className="size-4 shrink-0" />}
                      disabled={methods.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="flex flex-row items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href={routes.dashboard.auth.forgetPassword.Index}
                      className="ml-auto inline-block text-sm underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <InputPassword
                      {...field}
                      maxLength={72}
                      autoCapitalize="off"
                      autoComplete="current-password"
                      startAdornment={<LockIcon className="size-4 shrink-0" />}
                      disabled={methods.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {errorMessage && (
              <Alert variant="destructive">
                <div className="flex flex-row items-center gap-2">
                  <AlertCircleIcon className="size-[18px] shrink-0" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </div>
              </Alert>
            )}
            <Button
              type="submit"
              variant="default"
              className="w-full relative"
              disabled={!canSubmit}
              loading={methods.formState.isSubmitting}
              onClick={methods.handleSubmit(onSubmit)}
            >
              Sign in
            </Button>
          </form>
        </Form>
        <OrContinueWith />
        <div className="flex flex-row gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex w-full flex-row items-center gap-2"
            disabled={!canSubmit}
          >
            <GoogleLogo width="20" height="20" />
            Google
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-1 text-sm text-muted-foreground">
        <span>Don't have an account?</span>
        <Link
          href={routes.dashboard.auth.SignUp}
          className="text-foreground underline"
        >
          Sign up
        </Link>
      </CardFooter>
    </Card>
  );
}
